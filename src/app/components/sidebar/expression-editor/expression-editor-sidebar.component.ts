import {Component, style, animate, state, transition, trigger} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {VisibilityState} from "../../clt-editor/animation.states";
import {ExpressionEditorComponent} from "../expression-editor/expression-editor.component";
import {InputProperty} from "../../../models/input-property.model";
import {OpenExpressionEditor, CloseExpressionEditor} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";

require ("../shared/editor-sidebar.component.scss");

@Component({
    selector: "expression-editor-sidebar-component",
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
        ExpressionEditorComponent
    ],
    template: `
            <div class="sidebar-component" @sidebarState="sidebarState">
                <div class="sidebar-content">
                    
                    <div class="collapse-icon" (click)="collapseSidebar()">
                        <i class="fa fa-lg fa-caret-left"></i>
                    </div>
                    
                    <!--TODO: pass in data-->
                    <expression-editor *ngIf="sidebarData"></expression-editor>
                </div>
            </div>
    `
})
export class ExpressionEditorSidebarComponent {
    /** State of the sidebar animation */
    private sidebarState: VisibilityState = "hidden";

    /** Data that we are passing to the sidebar */
    private sidebarData: Observable<InputProperty>;

    constructor(private eventHubService: EventHubService) {

        this.eventHubService.on(OpenExpressionEditor).subscribe((action) => {
            this.sidebarData = action.payload;
            this.sidebarState = "visible";
        });

        this.eventHubService.on(CloseExpressionEditor).subscribe(() => {
            this.sidebarState = "hidden";
        });
    }

    private collapseSidebar(): void {
        this.eventHubService.publish(new CloseExpressionEditor());
    }
}
