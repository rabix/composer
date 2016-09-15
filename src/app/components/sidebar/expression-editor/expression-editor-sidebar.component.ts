import {Component, style, animate, state, transition, trigger, OnDestroy} from "@angular/core";
import {VisibilityState} from "../../clt-editor/animation.states";
import {ExpressionEditorComponent} from "../expression-editor/expression-editor.component";
import {
    OpenExpressionEditor,
    CloseExpressionEditor,
    OpenInputInspector,
    CloseInputInspector
} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {Subscription} from "rxjs/Subscription";

require ("../shared/editor-sidebar.component.scss");

@Component({
    selector: "expression-editor-sidebar-component",
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
        ExpressionEditorComponent
    ],
    template: `
            <div class="sidebar-component" @sidebarState="sidebarState" [ngClass]="{isTopOfStack: isTop}">
                <div class="sidebar-content">
                    
                    <div class="collapse-icon" (click)="collapseSidebar()">
                        <i class="fa fa-lg fa-caret-left"></i>
                    </div>
                    
                    <expression-editor></expression-editor>
                </div>
            </div>
    `
})
export class ExpressionEditorSidebarComponent implements OnDestroy {
    /** State of the sidebar animation */
    private sidebarState: VisibilityState = "hidden";

    private isTop: boolean;

    private subs: Subscription[];

    constructor(private eventHubService: EventHubService) {
        this.subs = [];

        this.subs.push(this.eventHubService.on(OpenExpressionEditor).subscribe(() => {
            this.sidebarState = "visible";
            this.isTop = true;
        }));

        this.subs.push(this.eventHubService.on(CloseExpressionEditor).subscribe(() => {
            this.sidebarState = "hidden";
        }));

        this.subs.push(this.eventHubService.on(OpenInputInspector).subscribe(() => {
            this.isTop = false;
        }));

        this.subs.push(this.eventHubService.on(CloseInputInspector).subscribe(() => {
            this.isTop = true;
        }));
    }

    private collapseSidebar(): void {
        this.eventHubService.publish(new CloseExpressionEditor());
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
