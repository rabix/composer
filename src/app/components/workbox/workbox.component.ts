import {Component, OnInit, ElementRef, ViewChildren, QueryList} from "@angular/core";
import {TabData} from "./tab-data.interface";
import {ComponentBase} from "../common/component-base";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../core/ui/menu/menu-item";
import {WorkboxService} from "./workbox.service";
import {StatusBarService} from "../../core/status-bar/status-bar.service";
import {StatusControlProvider} from "../../core/status-bar/status-control-provider.interface";
require("./workbox.component.scss");
@Component({
    host: {"class": "ct-workbox"},
    selector: 'ct-workbox',
    template: `
        <div class="ct-workbox-head">
            <ul class="list-inline ct-tab-bar inset-panel" tabindex="-1">
                <li *ngFor="let tab of tabs; let i = index;"
                    (click)="workbox.openTab(tab)"
                    [class.active]="tab === (workbox.activeTab | async)"
                    [ct-context]="createContextMenu(tab)"
                    class="ct-workbox-tab clickable">
                    <div class="title">{{ tab.title | async }}</div>
                    <div (click)="removeTab(tab)" class="close-icon">×</div>
                </li>
            </ul>
            <ct-settings-button></ct-settings-button>
            
        </div>
        <div class="ct-workbox-body">
            <span *ngFor="let tab of tabs" [hidden]="tab !== activeTab">
                <div [ngSwitch]="tab?.contentType | async" class="full-height">
                    <ct-tool-editor #tabComponent *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
                    <ct-workflow-editor [data]="tab.contentData" *ngSwitchCase="'Workflow'"></ct-workflow-editor>
                    <ct-file-editor [data]="tab.contentData" *ngSwitchCase="'Code'"></ct-file-editor>
                    <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
                    <block-loader *ngSwitchDefault></block-loader>
                </div>
            </span>
        </div>
    `
})
export class WorkboxComponent extends ComponentBase implements OnInit {

    /** List of tab data objects */
    public tabs: TabData<any>[] = [];

    /** Reference to an active tab object */
    public activeTab;

    private el: Element;

    @ViewChildren("tabComponent")
    private tabComponents: QueryList<any>;

    constructor(private ipc: IpcService,
                public workbox: WorkboxService,
                private statusBar: StatusBarService,
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

    ngAfterViewInit() {
        this.tracked = this.workbox.activeTab.subscribe(tab => {
            this.statusBar.removeControls();

            this.activeTab  = tab;
            const idx       = this.tabs.findIndex(t => t === tab);

            const component = this.tabComponents.find((item, index) => index === idx);

            if (component && (component as StatusControlProvider).provideStatusControls) {
                this.statusBar.setControls(component.provideStatusControls());
            }
        });
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
        this.tabs = [];
    }

    private createContextMenu(tab): MenuItem[] {
        const closeOthers = new MenuItem("Close Others", {
            click: () => this.removeOtherTabs(tab)
        });

        const closeAll = new MenuItem("Close All", {
            click: () => this.removeAllTabs()
        });

        return [closeOthers, closeAll];
    }
}
