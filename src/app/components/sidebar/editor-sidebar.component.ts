import {Component, style, animate, state, transition, trigger} from "@angular/core";
import {BehaviorSubject} from "rxjs/Rx";
import {ObjectInspectorComponent} from "./object-inpsector/object-insepctor.component";
import {VisibilityState} from "../clt-editor/animation.states";
import {SidebarType} from "./shared/sidebar.type";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";
import {InputProperty} from "../../models/input-property.model";
import {
    OpenInputInspector,
    OpenExpressionEditor,
    CloseExpressionEditor,
    CloseInputInspector
} from "../../action-events/index";
import {EventHubService} from "../../services/event-hub/event-hub.service";

require ("./editor-sidebar.component.scss");

@Component({
    selector: "editor-sidebar",
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
        ObjectInspectorComponent,
        ExpressionEditorComponent
    ],
    template: `
            <div class="editor-sidebar-component" @sidebarState="sidebarState">
                <div class="sidebar-content">
                    
                    <div class="collapse-icon" (click)="collapseSidebar()">
                        <i class="fa fa-lg fa-caret-left" 
                           [ngClass]="{'black': sidebar === sideBarType.ObjectInspector}"></i>
                    </div>
                    <expression-editor *ngIf="sidebar === sideBarType.Expression">
                    </expression-editor>
                    
                    <object-inspector *ngIf="sidebar === sideBarType.ObjectInspector"
                                      [(inputModelStream)]="sidebarData">
                    </object-inspector>
                </div>
            </div>
    `
})
export class EditorSidebarComponent {
    /** State of the sidebar animation */
    private sidebarState: VisibilityState;

    /** The sidebar enum reference that we use in the template for comparison */
    private sideBarType = SidebarType;

    /** The type of the sidebar */
    private sidebar: SidebarType;

    /** Data that we are passing to the sidebar */
    private sidebarData: BehaviorSubject<InputProperty>;

    constructor(private eventHubService: EventHubService) {

        this.eventHubService.on(OpenInputInspector).subscribe((action) => {
            this.sidebarData = action.payload;
            this.sidebar = SidebarType.ObjectInspector;
            this.sidebarState = "visible";
        });

        this.eventHubService.on(OpenExpressionEditor).subscribe((action) => {
            this.sidebarData = action.payload;
            this.sidebar = SidebarType.Expression;
            this.sidebarState = "visible";
        });

        const closeSideBar = this.eventHubService.on(CloseInputInspector)
            .merge(this.eventHubService.on(CloseExpressionEditor));

        closeSideBar.subscribe(() => {
            this.sidebarState = "hidden";
        });
    }

    private collapseSidebar(): void {
        if (this.sidebar === SidebarType.Expression) {
            this.eventHubService.publish(new CloseExpressionEditor());
        } else {
            this.eventHubService.publish(new CloseInputInspector());
        }
    }
}
