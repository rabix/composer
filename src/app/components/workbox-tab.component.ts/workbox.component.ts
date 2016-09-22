import {Component, OnInit} from "@angular/core";
import {FileModel} from "../../store/models/fs.models";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenFileRequestAction} from "../../action-events";
import {TabManagerComponent} from "../tab-manager/tab-manager.component";
import {FileRegistry} from "../../services/file-registry.service";
import {Subscription} from "rxjs";

require("./workbox.component.scss");

@Component({
    host: {class: "ct-workbox"},
    selector: 'ct-workbox',
    directives: [TabManagerComponent],
    template: `
        <div class="ct-workbox-head">
            <ul class="list-inline ct-tab-bar inset-panel" tabindex="-1">
                <li *ngFor="let tab of tabs"
                    (click)="activeTab = tab"
                    [class.active]="tab === activeTab"
                    class="ct-workbox-tab clickable">
                    <div class="title">{{ tab.title }}</div>
                    <div (click)="removeTab(index)" class="close-icon">×</div>
                </li>
            </ul>
        </div>
        <div class="ct-workbox-body">
           <tab-manager *ngFor="let tab of tabs" 
                        [hidden]="tab !== activeTab" 
                        [file]="activeTab.content">
           </tab-manager>
        </div>
    `
})
export class WorkboxComponent implements OnInit {

    /** List of tab data objects */
    private tabs = [];

    /** Reference to an active tab object */
    private activeTab;

    /** Holds the created subscriptions that should be disposed on destroy */
    private subs: Subscription[] = [];

    constructor(private eventHub: EventHubService, private files: FileRegistry) {
    }

    ngOnInit() {
        // Whenever a new file should be opened, we need to check it out and add it to the list of tabs 
        this.subs.push(this.eventHub.onValueFrom(OpenFileRequestAction).subscribe((file: FileModel) => {

            // Check if that file is already open. If so, activate that tab and we're done.
            const existingTab = this.tabs.find(t => t.id === file.id);
            if (existingTab) {
                this.activeTab = existingTab;
                return;
            }

            // Otherwise, we need to create a new tab and activate it.
            this.tabs.push({
                title: file.name,
                id: file.id,
                content: this.files.watchFile(file)
            });
            this.activeTab = this.tabs[this.tabs.length - 1];
        }));

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

    ngOnDestroy(){
        this.subs.forEach(s => s.unsubscribe());
    }

}