import {Component, OnInit, ElementRef} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenTabAction} from "../../action-events";
import {TabData} from "./tab-data.interface";
import {ComponentBase} from "../common/component-base";
import {IpcService} from "../../services/ipc.service";

require("./workbox.component.scss");

@Component({
    host: {"class": "ct-workbox"},
    selector: 'ct-workbox',
    template: `
        <div class="ct-workbox-head">
            <ul class="list-inline ct-tab-bar inset-panel" tabindex="-1">
                <li *ngFor="let tab of tabs; let i = index;"
                    (click)="activeTab = tab"
                    [class.active]="tab === activeTab"
                    class="ct-workbox-tab clickable">
                    <div class="title">{{ tab.title | async }}</div>
                    <div (click)="removeTab(i)" class="close-icon">×</div>
                </li>
            </ul>
            <ct-settings-button></ct-settings-button>
            
        </div>
        <div class="ct-workbox-body">
           <ct-tab-manager *ngFor="let tab of tabs" 
                        [hidden]="tab !== activeTab" 
                        [tab]="tab">
           </ct-tab-manager>
        </div>
    `
})
export class WorkboxComponent extends ComponentBase implements OnInit {

    /** List of tab data objects */
    private tabs: TabData[] = [];

    /** Reference to an active tab object */
    private activeTab;

    private el: Element;

    constructor(private eventHub: EventHubService,
                private ipc: IpcService,
                el: ElementRef) {
        super();

        this.el = el.nativeElement;
    }

    ngOnInit() {

        // FIXME: this needs to be handled in a system-specific way
        // Listen for a shortcut that should close the active tab
        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+W").subscribe(() => {
            this.removeTab(this.tabs.indexOf(this.activeTab));
        });

        this.tracked = this.eventHub.onValueFrom(OpenTabAction).subscribe((tab: TabData) => {
            // Check if that tab id is already open. If so, activate that tab and we're done.
            const existingTab = this.tabs.find(t => t.id === tab.id);
            if (existingTab) {
                this.activeTab = existingTab;
                return;
            }

            // Otherwise, we need to create a new tab and activate it.
            this.tabs.push(tab);
            this.activeTab = this.tabs[this.tabs.length - 1];
        });
    }

    /**
     * Removes a tab by index
     * @param index
     */
    public removeTab(index: Number) {
        const removedTab = this.tabs.splice(index, 1)[0];

        if (this.activeTab === removedTab) {
            this.activeTab = this.tabs[this.tabs.length > index ? index : 0];
        }
    }
}