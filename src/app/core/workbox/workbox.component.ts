import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../auth/auth.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../ui/menu/menu-item";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TabData} from "./tab-data.interface";
import {WorkboxService} from "./workbox.service";

@Component({
    selector: "ct-workbox",
    styleUrls: ["./workbox.component.scss"],
    template: `
        <div class="head">

            <ul class="tab-bar inset-panel" tabindex="-1">

                <li *ngFor="let tab of tabs"
                    [ct-drag-over]="true"
                    (onDragOver)="workbox.openTab(tab)"
                    ct-click
                    (onMouseClick)="onTabClick($event, tab)"
                    [class.active]="tab === (workbox.activeTab | async)"
                    [ct-context]="createContextMenu(tab)"
                    class="tab">

                    <div class="tab-icon">
                        <i class="fa"
                           [class.fa-home]="tab?.type === 'Welcome'"
                           [class.fa-file-text-o]="tab?.type === 'Code'"
                           [class.fa-share-alt]="tab?.type === 'Workflow'"
                           [class.fa-terminal]="tab?.type === 'CommandLineTool'"
                           [class.fa-file-o]="tab?.type === 'NewFile'"
                           [class.fa-sliders]="tab?.type === 'Settings'"
                        ></i>
                    </div>

                    <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">{{ tab.label
                        }}
                    </div>
                    <div class="close-icon">
                        <i class="fa fa-times clickable" (click)="removeTab(tab)"></i>
                    </div>

                    <!--Tooltip content-->
                    <ct-tooltip-content [maxWidth]="500" #ctt>
                        <div>
                            {{ tab.data?.id}}
                        </div>
                    </ct-tooltip-content>
                </li>

                <li class="ct-workbox-add-tab-icon clickable" (click)="openNewFileTab()">
                    <i class="fa fa-plus"></i>
                </li>

            </ul>

            <ct-settings-menu></ct-settings-menu>
        </div>

        <div class="body">

            <div class="component-container" *ngFor="let tab of tabs" [class.hidden]="tab !== activeTab">

                <ct-workbox-tab #workBoxTabComponent [tab]="tab" [isActive]="activeTab === tab"></ct-workbox-tab>

            </div>

        </div>
    `
})
export class WorkBoxComponent extends DirectiveBase implements OnInit, AfterViewInit {

    /** List of tab data objects */
    public tabs: TabData<any>[] = [];

    /** Reference to an active tab object */
    public activeTab: TabData<any>;

    private el: Element;

    @ViewChildren("workBoxTabComponent")
    private tabComponents: QueryList<any>;

    constructor(private ipc: IpcService,
                public workbox: WorkboxService,
                private auth: AuthService,
                private local: LocalRepositoryService,
                private statusBar: StatusBarService,
                private cdr: ChangeDetectorRef,
                el: ElementRef) {
        super();
        this.el = el.nativeElement;
    }

    ngOnInit() {

        // FIXME: this needs to be handled in a system-specific way
        // Listen for a shortcut that should close the active tab
        this.ipc.watch("accelerator", "CmdOrCtrl+W").subscribeTracked(this, () => {
            this.workbox.closeTab();
        });

        // Switch to the tab on the right
        this.ipc.watch("accelerator", "CmdOrCtrl+Shift+]")
            .filter(_ => this.activeTab && this.tabs.length > 1)
            .subscribeTracked(this, () => {
                this.workbox.activateNext();
            });

        // Switch to the tab on the left
        this.ipc.watch("accelerator", "CmdOrCtrl+Shift+[")
            .filter(_ => this.activeTab && this.tabs.length > 1)
            .subscribeTracked(this, () => {
                this.workbox.activatePrevious();
            });


        this.workbox.tabs.subscribeTracked(this, tabs => {
            this.tabs = tabs;
        });
    }

    getTabComponent(tab) {
        const idx       = this.tabs.findIndex(t => t === tab);
        const component = this.tabComponents.find((item, index) => index === idx);
        return component;
    }

    ngAfterViewInit() {

        this.workbox.tabCreation.delay(1).subscribeTracked(this, tab => {
            const component = this.getTabComponent(tab);
            if (component && typeof component.registerOnTabLabelChange === "function") {
                component.registerOnTabLabelChange((title) => {
                    tab.label = title;
                    this.cdr.markForCheck();
                }, tab.label);
            }

        });
        this.workbox.activeTab.subscribeTracked(this, tab => {
            this.statusBar.removeControls();

            this.activeTab = tab;
            const idx      = this.tabs.findIndex(t => t === tab);

            const component = this.tabComponents.find((item, index) => index === idx);

            if (component) {

                const statusControl = component.provideStatusControls();

                if (statusControl) {
                    this.statusBar.setControls(statusControl);
                }

                setTimeout(() => {
                    component.onTabActivation();
                });
            }
        });

        setTimeout(() => {
            this.restoreTabs();
        });
    }

    /**
     * When you click on tab
     */
    onTabClick(event: MouseEvent, tab) {
        // Middle click
        if (event.button === 0) {
            this.workbox.openTab(tab);
        } else if (event.button === 1) {
            this.removeTab(tab);
        }
    }

    /**
     * Removes a tab by index
     */
    public removeTab(tab) {
        this.workbox.closeTab(tab);
    }

    /**
     * Removes all tabs except one
     */
    private removeOtherTabs(tab) {
        this.workbox.closeOtherTabs(tab);
    }

    /**
     * Removes all tabs
     */
    private removeAllTabs() {
        this.workbox.closeAllTabs();
    }

    /**
     * Opens a new file tab
     */
    openNewFileTab() {
        this.workbox.openTab({
            id: "?newFile",
            label: "New File",
            type: "NewFile"
        }, false);
    }

    /**
     * Opens a welcome tab
     */
    openWelcomeTab() {
        this.workbox.openTab({
            id: "?welcome",
            label: "Welcome",
            type: "Welcome"
        }, false);
    }

    createContextMenu(tab): MenuItem[] {
        const closeOthers = new MenuItem("Close Others", {
            click: () => this.removeOtherTabs(tab)
        });

        const closeAll = new MenuItem("Close All", {
            click: () => this.removeAllTabs()
        });

        return [closeOthers, closeAll];
    }

    restoreTabs() {

        this.workbox.startingTabs.subscribeTracked(this, tabDataList => {

            // const lastActiveTab = this.activeTab;
            this.workbox.tabs.next([]);
            this.workbox.activeTab.next(undefined);

            if (tabDataList.length === 0) {

                Observable.combineLatest(this.local.getLocalFolders(), this.auth.getActive(), (folders, cred) => {
                    return folders.length || cred;
                }).subscribeTracked(this, (hasSettings) => {
                    if (hasSettings) {
                        this.openNewFileTab();
                    } else {
                        this.openWelcomeTab();
                    }
                });

                return;
            }


            tabDataList.forEach(tabDataEntry => {

                if (tabDataEntry.id.startsWith("?")) {
                    this.workbox.openTab(tabDataEntry);
                    return;
                }

                const tab = this.workbox.getOrCreateAppTab(tabDataEntry);
                this.workbox.openTab(tab);
            });

            // if (lastActiveTab && lastActiveTab.id === "?settings") {
            //     this.workbox.activeTab.next(lastActiveTab);
            // }

        });
    }
}
