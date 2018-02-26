import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {RecentAppTab} from "../../../../electron/src/storage/types/recent-app-tab";
import {TabData} from "../../../../electron/src/storage/types/tab-data-interface";
import {AuthService} from "../../auth/auth.service";
import {FileRepositoryService} from "../../file-repository/file-repository.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {DataGatewayService} from "../data-gateway/data-gateway.service";
import {AppHelper} from "../helpers/AppHelper";
import {Store} from "@ngrx/store";
import {TabCloseAction} from "../actions/core.actions";
import {switchMap, take, map, filter} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {combineLatest} from "rxjs/observable/combineLatest";


@Injectable()
export class WorkboxService {

    tabs = new BehaviorSubject<TabData<any>[]>([]);

    activeTab = new BehaviorSubject(undefined);

    tabCreation = new Subject<TabData<any>>();

    closeTabStream = new Subject<TabData<any>>();

    closeAllTabsStream = new Subject<TabData<any> []>();

    homeTabData = {id: "?newFile", label: "Home", type: "NewFile"};

    private priorityTabUpdate = new Subject();

    constructor(private auth: AuthService,
                private dataGateway: DataGatewayService,
                private fileRepository: FileRepositoryService,
                private localRepository: LocalRepositoryService,
                private store: Store<any>,
                private platformRepository: PlatformRepositoryService) {

        // Whenever a user gets changed, we should restore their tabs
        this.auth.getActive().pipe(
            switchMap(() => this.getStoredTabs().pipe(
                take(1)
            )),
            // If we have no active tabs, add a "new file"
            map(tabDataList => tabDataList.length ? tabDataList : [this.homeTabData]),
            map(tabDataList => tabDataList.map(tabData => {
                return this.isUtilityTab(tabData) ? tabData : this.getOrCreateAppTab(tabData, true);
            }))
        ).subscribe(tabList => {
            this.tabs.next(tabList);
            this.ensureActiveTab();
        });
    }


    getStoredTabs() {


        const local    = this.localRepository.getOpenTabs();
        const platform = this.auth.getActive().pipe(
            switchMap(user => {
                if (!user) {
                    return of([]);
                }
                return this.platformRepository.getOpenTabs();
            }),
            filter(v => v !== null)
        );

        return combineLatest(local, platform,
            (local, platform) => [...local, ...platform].sort((a, b) => a.position - b.position)
        );
    }

    syncTabs(): Promise<any> {
        // First emit is an empty array (default), second emit is restoring tabs that were previously open
        // after that, start listening for newly added tabs

        const tabs = this.tabs.getValue();

        const localTabs    = [];
        const platformTabs = [];

        tabs.forEach((tab, position) => {
            const {id, label, type, isWritable, language} = tab;

            const entry = {id, label, type, isWritable, language, position};
            if (AppHelper.isLocal(entry.id)) {
                localTabs.push(entry);
            } else {
                platformTabs.push(entry);
            }
        });

        return Promise.all([
            this.localRepository.setOpenTabs(localTabs),
            this.platformRepository.setOpenTabs(platformTabs)
        ]);

    }

    isUtilityTab(tabData: TabData<any>): boolean {
        return tabData.id.startsWith("?");
    }

    forceReloadTabs() {
        this.priorityTabUpdate.next(1);
    }

    openTab(tab: TabData<any>, persistToRecentApps: boolean = true, syncState = true, replaceExistingIfExists = false) {

        const {tabs} = this.extractValues();

        // When opening an app, we use id with revision number because we can have cases when we can open the same app
        // different revisions (when we push a local file with existing id, new tab is open ...)
        const foundTabIndex = tabs.findIndex(existingTab => existingTab.id === tab.id);
        const foundTab      = tabs[foundTabIndex];

        if (foundTab) {
            if (replaceExistingIfExists) {
                this.dataGateway.updateSwap(foundTab.data.id, null);
                tabs.splice(foundTabIndex, 1, tab);
                this.tabs.next(tabs);
            } else {
                this.activateTab(foundTab);
                return;
            }

        } else {
            this.tabs.next(tabs.concat(tab));
        }

        this.tabCreation.next(tab);
        this.activateTab(tab);

        if (syncState) {
            this.syncTabs();
        }

        const isUtilityTab = tab.id.startsWith("?");

        if (persistToRecentApps && !isUtilityTab) {
            const recentTabData = {
                id: tab.id,
                label: tab.label,
                type: tab.type,
                isWritable: tab.isWritable,
                language: tab.language,
                description: tab.id,
                time: Date.now()
            } as RecentAppTab;


            if (AppHelper.isLocal(tab.id)) {
                this.localRepository.pushRecentApp(recentTabData);
            } else {
                this.platformRepository.pushRecentApp(recentTabData);
            }
        }
    }

    openSettingsTab() {
        this.openTab({
            id: "?settings",
            label: "Settings",
            type: "Settings"
        }, false);
    }

    /**
     * Closes a tab
     */
    closeTab(tab?: TabData<any>, force: boolean = false) {

        if (!tab) {
            tab = this.extractValues().activeTab;
        }

        if (!force) {
            this.closeTabStream.next(tab);
            return;
        }

        if (tab && tab.data && tab.data.id) {
            this.dataGateway.updateSwap(tab.data.id, null);
            this.store.dispatch(new TabCloseAction(tab.data.id));
        }

        const currentlyOpenTabs = this.tabs.getValue();
        const tabToRemove       = currentlyOpenTabs.find(t => t.id === tab.id);
        const newTabList        = currentlyOpenTabs.filter(t => t !== tabToRemove);


        this.tabs.next(newTabList);
        this.ensureActiveTab();

        this.syncTabs();
    }

    /**
     * Closes all tabs except one that should be preserved
     */
    closeAllTabs(preserve: TabData<any>[] = [], force: boolean = false) {

        if (!force) {
            this.closeAllTabsStream.next(preserve);
            return;
        }

        this.tabs.getValue().forEach((item) => {
            if (!preserve.includes(item)) {
                this.closeTab(item, true);
            }
        });

    }

    activateNext() {
        const {tabs, activeTab} = this.extractValues();
        const index             = tabs.indexOf(activeTab);
        const newActiveTab      = index === (tabs.length - 1) ? tabs[0] : tabs[index + 1];

        this.activateTab(newActiveTab);
    }

    activatePrevious() {
        const {tabs, activeTab} = this.extractValues();
        const index             = tabs.indexOf(activeTab);
        const newActiveTab      = index ? tabs[index - 1] : tabs[tabs.length - 1];

        this.activateTab(newActiveTab);
    }

    private ensureActiveTab() {
        const {tabs, activeTab} = this.extractValues();
        if (!tabs.find(t => t === activeTab)) {
            this.activateTab(tabs[tabs.length - 1]);
        }
    }

    private extractValues() {
        return {
            activeTab: this.activeTab.getValue(),
            tabs: this.tabs.getValue()
        };
    }

    private activateTab(tab) {
        if (this.activeTab.getValue() === tab) {
            return;
        }

        this.activeTab.next(tab);
    }

    getOrCreateAppTab<T>(data: TabData<any>, forceCreate = false, forceFetch = false): TabData<T> {

        if (!forceCreate) {
            const currentTab = this.tabs.getValue().find(existingTab => existingTab.id === data.id);

            if (currentTab) {
                return currentTab;
            }
        }


        const dataSource = DataGatewayService.getFileSource(data.id);

        const id         = data.id;
        const label      = AppHelper.getBasename(data.id);
        const isWritable = data.isWritable;


        const fileContent = of(1).pipe(
            switchMap(() => {
                if (dataSource === "local") {
                    return this.fileRepository.fetchFile(id, forceFetch);
                }
                return this.platformRepository.getAppContent(id, forceFetch);
            })
        );

        const resolve = (fcontent: string) => this.dataGateway.resolveContent(fcontent, id);

        const tab = Object.assign({
            label,
            isWritable,
            data: {
                id,
                isWritable,
                dataSource,
                language: data.language || "yaml",
                fileContent,
                resolve
            }
        }, data) as TabData<any>;

        if (id.endsWith(".json") && !data.language) {
            tab.data.language = "json";
        }

        this.tabCreation.next(tab);

        return tab;

    }
}


