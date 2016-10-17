import {Component, OnInit} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenTabAction} from "../../action-events";
import {TabManagerComponent} from "../tab-manager/tab-manager.component";
import {Subscription} from "rxjs";
import {TabData} from "./tab-data.interface";
import {SettingsButtonComponent} from "./settings-button.component";

require("./workbox.component.scss");

@Component({
    host: {class: "ct-workbox"},
    selector: 'ct-workbox',
    directives: [TabManagerComponent, SettingsButtonComponent],
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
export class WorkboxComponent implements OnInit {

    /** List of tab data objects */
    private tabs: TabData[] = [];

    /** Reference to an active tab object */
    private activeTab;

    /** Holds the created subscriptions that should be disposed on destroy */
    private subs: Subscription[] = [];

    constructor(private eventHub: EventHubService) {

    }

    ngOnInit() {

        this.subs.push(
            this.eventHub.onValueFrom(OpenTabAction).subscribe((tab: TabData) => {
                // Check if that tab id is already open. If so, activate that tab and we're done.
                const existingTab = this.tabs.find(t => t.id === tab.id);
                if (existingTab) {
                    this.activeTab = existingTab;
                    return;
                }

                // Otherwise, we need to create a new tab and activate it.
                this.tabs.push(tab);
                this.activeTab = this.tabs[this.tabs.length - 1];
            })
        );

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

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }
}