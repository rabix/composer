import {Component, OnInit, ElementRef} from "@angular/core";
import {TabData} from "./tab-data.interface";
import {ComponentBase} from "../common/component-base";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../core/ui/menu/menu-item";
import {WorkboxService} from "./workbox.service";

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
           <ct-tab-manager *ngFor="let tab of tabs" 
                        [hidden]="tab !== (workbox.activeTab | async)" 
                        [tab]="tab">
           </ct-tab-manager>
        </div>
    `
})
export class WorkboxComponent extends ComponentBase implements OnInit {

    /** List of tab data objects */
    public tabs: TabData<any>[] = [];

    /** Reference to an active tab object */
    public activeTab;

    private el: Element;

    constructor(private ipc: IpcService,
                public workbox: WorkboxService,
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

        this.tracked = this.workbox.activeTab.subscribe(tab => {
            this.activeTab = tab;
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
