import {Component, OnDestroy} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {InputInspectorComponent} from "./input-inspector.component";
import {OpenInputInspector, CloseInputInspector} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/lib/models/d2sb";

@Component({
    selector: "input-inspector-sidebar-component",
    directives: [
        InputInspectorComponent
    ],
    template: `
            <div class="sidebar-component">
                <div class="sidebar-content">
                    
                    <div class="collapse-icon" (click)="collapseSidebar()">
                        <i class="fa fa-lg fa-caret-left black"></i>
                    </div>
                    
                    <input-inspector *ngIf="sidebarData" [(inputModelStream)]="sidebarData">
                    </input-inspector>
                </div>
            </div>
    `
})
export class InputInspectorSidebarComponent implements OnDestroy {

    /** Data that we are passing to the sidebar */
    private sidebarData: Observable<InputProperty>;

    private subs: Subscription[];

    constructor(private eventHubService: EventHubService) {
        this.subs = [];

        this.subs.push(this.eventHubService.on(OpenInputInspector).subscribe((action) => {
            this.sidebarData = action.payload;
        }));
    }

    private collapseSidebar(): void {
        this.eventHubService.publish(new CloseInputInspector());
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
