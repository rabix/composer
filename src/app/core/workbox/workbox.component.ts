import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../ui/menu/menu-item";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TabData} from "./tab-data.interface";
import {WorkboxService} from "./workbox.service";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ModalService} from "../../ui/modal/modal.service";
import {noop} from "../../lib/utils.lib";


@Component({
    selector: "ct-workbox",
    styleUrls: ["./workbox.component.scss"],
    template: `
        <div class="head">

            <ul class="tab-bar inset-panel" tabindex="-1">

                <li *ngFor="let tab of tabs; let i = index"
                    [ct-drag-over]="true"
                    (onDragOver)="workbox.openTab(tab)"
                    ct-click
                    (onMouseClick)="onTabClick($event, tab, tabComponents[i])"
                    [class.active]="tab === (workbox.activeTab | async)"
                    [class.isDirty]="tabComponents[i]?.appIsDirty"
                    [ct-context]="createContextMenu(tab)"
                    class="tab">

                    <!-- Tab label and title -->
                    <ng-container [ngSwitch]="tab?.type">

                        <!-- Welcome tab-->
                        <ng-template ngSwitchCase="Welcome">
                            <div class="tab-icon">
                                <i class="fa fa-home"></i>
                            </div>

                            <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">{{tab.label}}</div>
                        </ng-template>

                        <!-- Code tab-->
                        <ng-template ngSwitchCase="Code">
                            <div class="tab-icon">
                                <i class="fa fa-file-text-o"></i>
                            </div>

                            <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">{{tab.label}}</div>
                        </ng-template>

                        <!-- Workflow tab-->
                        <ng-template ngSwitchCase="Workflow">
                            <div class="tab-icon">
                                <i class="fa fa-share-alt"></i>
                            </div>

                            <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">
                                {{tabComponents[i]?.dataModel?.label || tab.label}}
                            </div>
                        </ng-template>

                        <!-- Command Line Tool tab-->
                        <ng-template ngSwitchCase="CommandLineTool">
                            <div class="tab-icon">
                                <i class="fa fa-terminal"></i>
                            </div>

                            <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">
                                {{tabComponents[i]?.dataModel?.label || tab.label}}
                            </div>
                        </ng-template>

                        <!-- New File tab-->
                        <ng-template ngSwitchCase="NewFile">
                            <div class="tab-icon">
                                <i class="fa fa-file-o"></i>
                            </div>

                            <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">{{tab.label}}</div>
                        </ng-template>

                        <!-- Settings tab-->
                        <ng-template ngSwitchCase="Settings">
                            <div class="tab-icon">
                                <i class="fa fa-cog"></i>
                            </div>

                            <div class="title" [ct-tooltip]="ctt" [tooltipPlacement]="'bottom'">{{tab.label}}</div>
                        </ng-template>

                    </ng-container>

                    <div class="close-icon">
                        <i class="fa fa-times clickable" (click)="removeTab(tab, tabComponents[i])"></i>
                    </div>

                    <!--Tooltip content-->
                    <ct-tooltip-content [maxWidth]="500" #ctt>
                        {{ tab.data?.id || tab.label}}
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

                <ct-workbox-tab #tabComponentContainer
                                [tab]="tab"
                                [isActive]="activeTab === tab">
                </ct-workbox-tab>

            </div>

        </div>
    `
})
export class WorkBoxComponent extends DirectiveBase implements OnInit, AfterViewInit {

    /** List of tab data objects */
    tabs: TabData<any>[] = [];

    /** Reference to an active tab object */
    activeTab: TabData<any>;

    private el: Element;

    @ViewChildren("tabComponentContainer")
    private tabComponentContainers: QueryList<any>;

    /**  Components that are shown in tab */
    tabComponents = [];

    constructor(private ipc: IpcService,
                public workbox: WorkboxService,
                private auth: AuthService,
                private local: LocalRepositoryService,
                private statusBar: StatusBarService,
                private cdr: ChangeDetectorRef,
                private modal: ModalService,
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

    ngAfterViewInit() {

        const replayComponents = new ReplaySubject(1);
        this.tabComponentContainers.changes.subscribeTracked(this, replayComponents);

        this.workbox.activeTab.subscribeTracked(this, () => {
            this.statusBar.removeControls();
        });

        this.workbox.activeTab.delay(1).switchMap(tab => replayComponents.filter((list: QueryList<any>) => {
            return list.find((item) => item.tab === tab);
        }), (tab) => tab)
            .subscribeTracked(this, (tab) => {

                this.activeTab = tab;
                const idx = this.tabs.findIndex(t => t === tab);

                const component = this.tabComponentContainers.find((item, index) => index === idx);

                if (component) {

                    this.statusBar.setControls(component.provideStatusControls());

                    setTimeout(() => {
                        component.onTabActivation();
                    });
                }
            });

        this.tabComponentContainers.changes.startWith(this.tabComponentContainers).delay(1)
            .subscribeTracked(this , (components) => {
                this.tabComponents = components.toArray().map((c) => c.tabComponent);
            });
    }

    getTabComponent(tab) {
        const idx = this.tabs.findIndex(t => t === tab);
        return this.tabComponentContainers.find((item, index) => index === idx);
    }

    /**
     * When you click on tab
     */
    onTabClick(event: MouseEvent, tab, component) {
        // Middle click
        if (event.button === 0) {
            this.workbox.openTab(tab);
        } else if (event.button === 1) {
            this.removeTab(tab, component);
        }
    }

    /**
     * Removes a tab by index
     */
    removeTab(tab, component) {

        if (component.appIsDirty) {

            // If app is Dirty show modal
            const modal = this.modal.confirm({
                title: "Remove tab",
                showDiscardButton: true,
                content: `
                Do you want to save the changes made to the document?<br/>
                Your changes will be lost if you don't save them.`,
                confirmationLabel: "Save",
                discardLabel: "Close without saving"
            });

            modal.then(() => {
                // If click on Save button
                component.save();
            }, (result) => {
                if (result === true) {
                    // If click on Discard button
                    this.workbox.closeTab(tab);
                }
            });

        } else {
            this.workbox.closeTab(tab);
        }
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
            click: () => this.removeAllTabs(tab)
        });

        const closeAll = new MenuItem("Close All", {
            click: () => this.removeAllTabs()
        });

        return [closeOthers, closeAll];
    }

    /**
     * Removes all tabs or all other tabs (if tab is passed as an argument)
     */
    private removeAllTabs(tab?: TabData<any>) {

        const component = tab ? this.getTabComponent(tab).tabComponent : null;

        const hasDirtyTabs = this.tabComponents.find((tabComponent) => {
            return tabComponent.appIsDirty && (tabComponent !== component);
        });

        const modalTitle = `Close ${tab ? "other" : "all"} tabs`;

        if (hasDirtyTabs) {

            // If there are apps that are Dirty show modal
            const modal = this.modal.confirm({
                title: modalTitle,
                content: `Some documents are modified.<br>
                          Your changes will be lost if you don't save them.`,
                confirmationLabel: modalTitle,
            });

            modal.then(() => {
                this.workbox.closeAllTabs(tab);
            }, noop);

        } else {
            this.workbox.closeAllTabs(tab);
        }

    }
}
