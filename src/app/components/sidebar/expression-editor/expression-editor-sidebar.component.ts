import {Component, style, animate, state, transition, trigger} from "@angular/core";
import {VisibilityState} from "../../clt-editor/animation.states";
import {ExpressionEditorComponent} from "../expression-editor/expression-editor.component";
import {CloseExpressionEditor} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";

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
            <div class="sidebar-component">
                <div class="sidebar-content">
                    
                    <div class="collapse-icon" (click)="collapseSidebar()">
                        <i class="fa fa-lg fa-caret-left"></i>
                    </div>
                    
                    <expression-editor></expression-editor>
                </div>
            </div>
    `
})
export class ExpressionEditorSidebarComponent {
    /** State of the sidebar animation */
    private sidebarState: VisibilityState = "hidden";
    
    constructor(private eventHubService: EventHubService) { }
    
    private collapseSidebar(): void {
        this.eventHubService.publish(new CloseExpressionEditor());
    }
}
