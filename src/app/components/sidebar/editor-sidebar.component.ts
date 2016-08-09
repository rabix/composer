import {Component, OnInit, style, animate, state, transition, trigger, Input} from "@angular/core";
import {BehaviorSubject} from "rxjs/Rx";
import {ObjectInspectorComponent} from "./object-inpsector/object-insepctor.component";
import {VisibilityState} from "../clt-editor/animation.states";
import {SidebarType} from "../clt-editor/shared/sidebar.type";
import {GuiEditorService} from "../clt-editor/shared/gui-editor.service";
import {SidebarEvent} from "../clt-editor/shared/gui-editor.events";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";

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
                                      [data]="sidebarData">
                    </object-inspector>
                </div>
            </div>
    `
})
export class EditorSidebarComponent implements OnInit {
    /** Emit changes of the sidebar animation to the parent component */
    @Input()
    private sidebarVisibility: BehaviorSubject<VisibilityState>;

    /** State of the sidebar animation */
    private sidebarState: VisibilityState;

    /** The sidebar enum reference that we use in the template for comparison */
    private sideBarType = SidebarType;

    /** The type of the sidebar */
    private sidebar: SidebarType;

    /** Data that we are passing to the sidebar */
    private sidebarData: Object;

    constructor(private guiEditorService: GuiEditorService) {
        this.guiEditorService.publishedSidebarEvents.subscribe((event: SidebarEvent) => {
            this.sidebarData = event.data || {};
            this.sidebar = event.sidebarType;
            this.showSideBar();
        });
    }

    ngOnInit(): void {
        this.sidebarVisibility.subscribe((state: VisibilityState) => {
            this.sidebarState = state;
        });
    }

    showSideBar(): void {
        this.sidebarVisibility.next("visible");
    }

    collapseSidebar(): void {
        this.sidebarVisibility.next("hidden");
    }
}
