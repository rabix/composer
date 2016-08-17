import {Component, style, animate, state, transition, trigger} from "@angular/core";
import {BehaviorSubject} from "rxjs/Rx";
import {ObjectInspectorComponent} from "./object-inpsector/object-insepctor.component";
import {VisibilityState} from "../clt-editor/animation.states";
import {SidebarType} from "./shared/sidebar.type";
import {CltEditorService} from "../clt-editor/shared/clt-editor.service";
import {SidebarEvent, SidebarEventType} from "./shared/sidebar.events";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";
import {InputProperty} from "../../models/input-property.model";

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

    constructor(private guiEditorService: CltEditorService) {
        this.guiEditorService.sidebarEvents
            .filter(ev => ev !== undefined)
            .subscribe((event: SidebarEvent) => {
                if (event.sidebarEventType === SidebarEventType.Show) {
                    this.sidebarData = event.data.stream;
                    this.sidebar = event.sidebarType;
                    this.sidebarState = "visible";
                } else {
                    this.sidebarState = "hidden";
                }
            });
    }
    
    collapseSidebar(): void {
        let editPropertySidebarEvent: SidebarEvent = {
            sidebarEventType: SidebarEventType.Hide
        };

        this.guiEditorService.sidebarEvents.next(editPropertySidebarEvent);
    }
}
