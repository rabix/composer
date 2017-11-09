import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../ui/menu/menu-item";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {TabData} from "../../../../electron/src/storage/types/tab-data-interface";
import {WorkboxService} from "./workbox.service";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ModalService} from "../../ui/modal/modal.service";
import {noop} from "../../lib/utils.lib";
import {ClosingDirtyAppsModalComponent} from "../modals/closing-dirty-apps/closing-dirty-apps-modal.component";


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
                    (onMouseClick)="onTabClick($event, tab)"
                    [class.active]="tab === (workbox.activeTab | async)"
                    [class.isDirty]="tabComponents[i]?.isDirty"
                    [ct-context]="createContextMenu(tab)"
                    class="tab">

                    <!-- Tab label and title -->
                    <ng-container [ngSwitch]="tab?.type">

                        <!-- Welcome tab-->
                        <ng-template ngSwitchCase="Welcome">
                            <div class="tab-icon">
                                <i class="fa fa-home"></i>
                            </div>

                            <div class="title" 
                                 data-test="welcome-tab-title" 
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'bottom'">
                                {{tab.label}}
                            </div>
                        </ng-template>

                        <!-- Code tab-->
                        <ng-template ngSwitchCase="Code">
                            <div class="tab-icon">
                                <i class="fa fa-file-text-o"></i>
                            </div>

                            <div class="title"
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'bottom'" 
                                 data-test="file-tab-title">
                                {{tab.label}}
                            </div>
                        </ng-template>

                        <!-- Workflow tab-->
                        <ng-template ngSwitchCase="Workflow">
                            <div class="tab-icon">
                                <i class="fa fa-share-alt"></i>
                            </div>

                            <div class="title" 
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'bottom'"
                                 data-test="workflow-tab-title">
                                {{tabComponents[i]?.dataModel?.label || tab.label}}
                            </div>
                        </ng-template>

                        <!-- Command Line Tool tab-->
                        <ng-template ngSwitchCase="CommandLineTool">
                            <div class="tab-icon">
                                <i class="fa fa-terminal"></i>
                            </div>

                            <div class="title" 
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'bottom'"
                                 data-test="tool-tab-title">
                                {{tabComponents[i]?.dataModel?.label || tab.label}}
                            </div>
                        </ng-template>

                        <!-- New File tab-->
                        <ng-template ngSwitchCase="NewFile">
                            <div class="tab-icon">
                                <i class="fa fa-file-o"></i>
                            </div>

                            <div class="title" 
                                 data-test="new-file-tab-title" 
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'bottom'">
                                {{tab.label}}
                            </div>
                        </ng-template>

                        <!-- Settings tab-->
                        <ng-template ngSwitchCase="Settings">
                            <div class="tab-icon">
                                <i class="fa fa-cog"></i>
                            </div>

                            <div class="title" 
                                 data-test="settings-tab-title"
                                 [ct-tooltip]="ctt" 
                                 [tooltipPlacement]="'bottom'">
                                {{tab.label}}
                            </div>
                        </ng-template>

                    </ng-container>

                    <div class="close-icon">
                        <i class="fa fa-times clickable" 
                           data-test="tab-close-button"
                           [attr.data-label]="tab.label"
                           (click)="closeTab(tab)"></i>
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

        this.workbox.closeTabStream.subscribeTracked(this, tab => {
           this.closeTab(tab);
        });

        this.workbox.closeAllTabsStream.subscribeTracked(this, tabs => {
            this.closeAllTabs(tabs);
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

                // activeTab has to be set in the next tick, otherwise we will have ExpressionChangedAfterItHadBeenCheckedError in some cases
                setTimeout(() => {
                    this.activeTab = tab;
                });

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
     * When you click on a tab
     */
    onTabClick(event: MouseEvent, tab, component) {
        // Middle click
        if (event.button === 0) {
            this.workbox.openTab(tab);
        } else if (event.button === 1) {
            this.workbox.closeTab(tab);
        }
    }

    /**
     * Closes a tab
     */
    closeTab(tab: TabData<any>) {

        const index = this.tabs.findIndex((t) => t === tab);

        if (index === -1) {
            return;
        }

        const component = this.tabComponents[index];

        if (component.isDirty) {

            const modal = this.modal.fromComponent(ClosingDirtyAppsModalComponent, {
                title: "Remove tab"
            });

            modal.confirmationLabel = "Save";
            modal.discardLabel = "Close without saving";

            modal.decision.take(1).subscribe((result) => {
                this.modal.close();
                result ? component.save() : this.workbox.closeTab(tab, true);
            });

        } else {
            this.workbox.closeTab(tab, true);
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
            click: () => this.closeAllTabs([tab])
        });

        const closeAll = new MenuItem("Close All", {
            click: () => this.closeAllTabs()
        });

        return [closeOthers, closeAll];
    }

    /**
     * Closes all tabs except ones that should be preserved
     */
    private closeAllTabs(preserve: TabData<any>[] = []) {

        const components = preserve.map((tab) => this.getTabComponent(tab).tabComponent);

        const hasDirtyTabs = this.tabComponents.find((tabComponent) => {
            return tabComponent.isDirty && !components.includes(tabComponent);
        });

        const modalTitle = `Close ${components.length ? "other" : "all"} tabs`;

        if (hasDirtyTabs) {
            //
            // If there are apps that are Dirty show modal
            const modal = this.modal.confirm({
                title: modalTitle,
                content: "Some documents are modified\nYour changes will be lost if you don't save them.",
                confirmationLabel: modalTitle,
            });

            modal.then(() => {
                this.workbox.closeAllTabs(preserve, true);
            }, noop);

        } else {
            this.workbox.closeAllTabs(preserve, true);
        }
    }
}
