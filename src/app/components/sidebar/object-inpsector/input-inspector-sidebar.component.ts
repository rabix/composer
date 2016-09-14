import {Component, style, animate, state, transition, trigger, OnDestroy} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {InputInspectorComponent} from "./input-inspector.component";
import {VisibilityState} from "../../clt-editor/animation.states";
import {InputProperty} from "../../../models/input-property.model";
import {
    OpenInputInspector,
    CloseInputInspector,
    OpenExpressionEditor,
    CloseExpressionEditor
} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";

require ("../shared/editor-sidebar.component.scss");

@Component({
    selector: "input-inspector-sidebar-component",
    animations: [
        trigger("sidebarState", [
            state("visible", style({
                display: "block",
                overflowY: "auto",
            })),
            state("hidden", style({
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
            <div class="sidebar-component" @sidebarState="sidebarState" [ngClass]="{isTopOfStack: isTop}">
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
    /** State of the sidebar animation */
    private sidebarState: VisibilityState = "hidden";

    /** Data that we are passing to the sidebar */
    private sidebarData: Observable<InputProperty>;

    private isTop: boolean;

    private subs: Subscription[];

    constructor(private eventHubService: EventHubService) {
        this.subs = [];

        this.subs.push(this.eventHubService.on(OpenInputInspector).subscribe((action) => {
            this.sidebarData = action.payload;
            this.sidebarState = "visible";
            this.isTop = true;
        }));

        this.subs.push(this.eventHubService.on(CloseInputInspector).subscribe(() => {
            this.sidebarState = "hidden";
        }));

        this.subs.push(this.eventHubService.on(OpenExpressionEditor).subscribe(() => {
            this.isTop = false;
        }));

        this.subs.push(this.eventHubService.on(CloseExpressionEditor).subscribe(() => {
            this.isTop = true;
        }));
    }

    private collapseSidebar(): void {
        this.eventHubService.publish(new CloseInputInspector());
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
