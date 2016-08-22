import {Component, style, animate, state, transition, trigger} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {InputInspectorComponent} from "./input-inspector.component";
import {VisibilityState} from "../../clt-editor/animation.states";
import {InputProperty} from "../../../models/input-property.model";
import {OpenInputInspector, CloseInputInspector} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";

require ("../shared/editor-sidebar.component.scss");

@Component({
    selector: "input-inspector-sidebar-component",
    animations: [
        trigger("sidebarState", [
            state("visible", style({
                width:"40%",
                display: "block",
                overflowY: "auto",
            })),
            state("hidden", style({
                width: "10%",
                display: "none",
                overflowY: "hidden"
            })),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    directives: [
        InputInspectorComponent
    ],
    template: `
            <div class="sidebar-component" @sidebarState="sidebarState">
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
export class InputInspectorSidebarComponent {
    /** State of the sidebar animation */
    private sidebarState: VisibilityState = "hidden";

    /** Data that we are passing to the sidebar */
    private sidebarData: Observable<InputProperty>;

    constructor(private eventHubService: EventHubService) {

        this.eventHubService.on(OpenInputInspector).subscribe((action) => {
            this.sidebarData = action.payload;
            this.sidebarState = "visible";
        });

        this.eventHubService.on(CloseInputInspector).subscribe(() => {
            this.sidebarState = "hidden";
        });
    }

    private collapseSidebar(): void {
        this.eventHubService.publish(new CloseInputInspector());
    }
}
