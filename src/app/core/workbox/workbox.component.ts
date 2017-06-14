import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../ui/menu/menu-item";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TabData} from "./tab-data.interface";
import {WorkboxService} from "./workbox.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

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

                    <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">{{ tab.label }}</div>
                    <div class="close-icon">
                        <i class="fa fa-times clickable" (click)="removeTab(tab)"></i>
                    </div>

                    <!--Tooltip content-->
                    <ct-tooltip-content [maxWidth]="500" #ctt>
                        <div>
                            {{ tab.data ? tab.data.parsedContent["sbg:id"] || tab.data.id : tab.label }}
                        </div>
                    </ct-tooltip-content>
                </li>

                <li class="ct-workbox-add-tab-icon clickable" (click)="openNewFileTab()">
                    <i class="fa fa-plus"></i>
                </li>

            </ul>

            <ct-settings-button></ct-settings-button>
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
    public activeTab;

    private el: Element;

    @ViewChildren("workBoxTabComponent")
    private tabComponents: QueryList<any>;

    constructor(private ipc: IpcService,
                public workbox: WorkboxService,
                private statusBar: StatusBarService,
                private preferences: UserPreferencesService,
                private cdr: ChangeDetectorRef,
                el: ElementRef) {
        super();
        this.el = el.nativeElement;
    }

    ngOnInit() {

        // FIXME: this needs to be handled in a system-specific way
        // Listen for a shortcut that should close the active tab
        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+W").subscribe(() => {
            this.workbox.closeTab();
        });

        // Switch to the tab on the right
        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+Shift+]")
            .filter(_ => this.activeTab && this.tabs.length > 1)
            .subscribe(() => {
                this.workbox.activateNext();
            });

        // Switch to the tab on the left
        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+Shift+[")
            .filter(_ => this.activeTab && this.tabs.length > 1)
            .subscribe(() => {
                this.workbox.activatePrevious();
            });


        this.tracked = this.workbox.tabs.subscribe(tabs => {
            this.tabs = tabs;
        });
    }

    getTabComponent(tab) {
        const idx       = this.tabs.findIndex(t => t === tab);
        const component = this.tabComponents.find((item, index) => index === idx);
        return component;
    }

    ngAfterViewInit() {

        this.tracked = this.workbox.tabCreation.delay(1).subscribe(tab => {
            const component = this.getTabComponent(tab);
            if (component && typeof component.registerOnTabLabelChange === "function") {
                component.registerOnTabLabelChange((title) => {
                    tab.label = title;
                    this.cdr.markForCheck();
                }, tab.label);
            }

        });
        this.tracked = this.workbox.activeTab.subscribe(tab => {
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
        Observable.zip(this.preferences.get("localFolders", []), this.preferences.get("openProjects", [])
            , this.preferences.get("openTabs", []), (localFolders, openProjects, openTabs) => {

                // If there are no open local folders or user projects) open welcome tab
                if (!(localFolders.length || openProjects.length)) {
                    this.openWelcomeTab();
                } else {

                    // If there are no open tabs (to restore), open new file tab
                    if (!openTabs.length) {
                        this.openNewFileTab();
                    } else {

                        // Restore open tabs
                        openTabs.forEach(tab => {
                            if (tab.id.startsWith("?")) {
                                this.workbox.openTab(tab, false);
                            } else {
                                this.workbox.getOrCreateFileTab(tab.id).take(1).subscribe(appTab => {
                                    this.workbox.openTab(appTab, false);
                                }, err => {
                                    console.warn("Cannot open app tab", tab);
                                });
                            }
                        });
                    }
                }
            }).take(1).subscribe(() => {
        });
    }
}
