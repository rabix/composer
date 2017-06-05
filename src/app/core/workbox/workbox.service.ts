import {Injectable} from "@angular/core";
import * as YAML from "js-yaml";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {DataGatewayService} from "../data-gateway/data-gateway.service";
import {AppTabData} from "./app-tab-data";
import {TabData} from "./tab-data.interface";


@Injectable()
export class WorkboxService {

    public tabs = new BehaviorSubject<TabData<any>[]>([]);

    public activeTab = new BehaviorSubject(undefined);

    public tabCreation = new Subject<TabData<any>>();

    constructor(private dataGateway: DataGatewayService,
                private preferences: UserPreferencesService) {

        this.tabs.skip(2).subscribe(tabs => {
            const t = tabs.map(tab => {
                const {id, label, type} = tab;
                return {id, label, type};
            });

            this.preferences.put("openTabs", t);
        });

        this.activeTab.filter(t => t !== undefined).subscribe(tab => {
            this.preferences.put("activeTab", tab.id);
        });
    }

    public openTab(tab, persistToRecentApps: boolean = true) {

        const {tabs} = this.extractValues();

        // When opening an app, we use id with revision number because we can have cases when we can open the same app
        // different revisions (when we publish a local file with existing id, new tab is open ...)
        const foundTab = tabs.find(existingTab => existingTab.id === tab.id);

        if (foundTab) {
            this.activateTab(foundTab);
            return;
        }

        if (persistToRecentApps) {
            this.preferences.get("recentApps", []).take(1).subscribe((recentApps) => {

                const tabIdSplit = tab.id.split("/");

                // Persist an app without revision number so in recently opened apps we can have only one app (no multiple
                // apps with different revisions)
                const tabId = isNaN(Number([...tabIdSplit].pop())) ? tab.id : (() => {
                    tabIdSplit.pop();
                    return tabIdSplit.join("/");
                })();

                // Remove from the recent apps if tab is already in the list
                const newArray = recentApps.filter((item) => item.id !== tabId);

                // Maximum number of recent apps
                if (newArray.length === 20) {
                    newArray.shift();
                }

                const itemToAdd = {
                    id: tabId,
                    label: tab.data.dataSource === "local" ? (() => {
                        const idSplit = tab.id.split("/");
                        idSplit.pop();
                        return idSplit.join("/");
                    })() : tab.data.parsedContent["sbg:project"],
                    title: tab.data.parsedContent.label || tab.label,
                    type: tab.type
                };

                newArray.push(itemToAdd);

                this.preferences.put("recentApps", newArray);
            });
        }

        this.tabs.next(tabs.concat(tab));
        this.tabCreation.next(tab);
        this.activateTab(tab);
    }

    public closeTab(tab?) {
        if (!tab) {
            tab = this.extractValues().activeTab;
        }

        const currentlyOpenTabs = this.tabs.getValue();
        const tabToRemove = currentlyOpenTabs.find(t => t.id === tab.id);
        const newTabList = currentlyOpenTabs.filter(t => t !== tabToRemove);

        this.tabs.next(newTabList);
        this.ensureActiveTab();
    }

    public closeOtherTabs(tab) {
        this.tabs.next([tab]);
        this.activateTab(tab);
    }

    public closeAllTabs() {
        this.tabs.next([]);
    }

    public activateNext() {
        const {tabs, activeTab} = this.extractValues();
        const index = tabs.indexOf(activeTab);
        const newActiveTab = index === (tabs.length - 1) ? tabs[0] : tabs[index + 1];

        this.activateTab(newActiveTab);
    }

    public activatePrevious() {
        const {tabs, activeTab} = this.extractValues();
        const index = tabs.indexOf(activeTab);
        const newActiveTab = index ? tabs[index - 1] : tabs[tabs.length - 1];

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

    public getOrCreateFileTabAndOpenIt(fileID) {
        this.getOrCreateFileTab(fileID).take(1).subscribe((tab) => this.openTab(tab));
    }

    public getOrCreateFileTab(fileID): Observable<TabData<AppTabData>> {

        const currentTab = this.tabs.getValue().find(tab => tab.id === fileID);
        if (currentTab) {
            return Observable.of(currentTab);
        }


        return this.dataGateway.fetchFileContent(fileID).map(content => {

            const dataSource = DataGatewayService.getFileSource(fileID);

            const tab = {
                id: fileID,
                label: fileID,
                type: "Code",
                isWritable: dataSource !== "public",
                data: {
                    id: fileID,
                    isWritable: dataSource !== "public",
                    dataSource,
                    language: "yaml",
                    parsedContent: {},
                    fileContent: content,
                    resolve: (fcontent: string) => this.dataGateway.resolveContent(fcontent, fileID)
                }
            };

            if (fileID.endsWith(".json")) {
                tab.data.language = "json";
            }

            try {

                const parsed = YAML.safeLoad(content, {json: true} as any);

                tab.data.parsedContent = parsed;

                if (dataSource === "public") {
                    tab.id = parsed.id;
                }

                if (dataSource !== "local") {
                    tab.data.fileContent = JSON.stringify(parsed, null, 4);
                }

                tab.label = parsed.label || fileID;

                if (["CommandLineTool", "Workflow"].indexOf(parsed.class) !== -1) {
                    tab.type = parsed.class;
                }

            } catch (ex) {
                console.warn("Could not parse app", ex);
            }

            if (dataSource === "local") {
                tab.label = fileID.split("/").pop();
            }

            return tab as any;

        });
    }
}


