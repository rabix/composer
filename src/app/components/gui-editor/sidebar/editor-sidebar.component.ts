import {
    Component,
    OnInit,
    style,
    animate,
    state,
    transition,
    trigger,
    Input
} from "@angular/core";
import {GuiEditorService} from "../shared/gui-editor.service";
import {VisibilityState} from "../animation.states";
import {ShowSidebarEvent} from "../shared/gui-editor.events";
import {BehaviorSubject} from "rxjs/Rx";
import {SidebarType} from "../shared/sidebar.types.ts"

require ("./editor-sidebar.component.scss");

/** TODO: make this switch between an expression editor and an object inspector*/
@Component({
    selector: "editor-sidebar",
    animations: [
        trigger("sidebarState", [
            state("visible", style({
                width:"40%",
                display: "block",
                overflowY: "auto"
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
    template: `
                    <div class="editor-sidebar-component" @sidebarState="sidebarState">
                        <div class="collapse-icon">
                            <i class="fa fa-lg fa-caret-left" (click)="collapseSidebar()"></i>
                        </div>
                        <div class="sidebar-content">
                            <!-- TODO: add expression and objects editor -->
                            <span *ngIf="sidebarType === 'editor'">
                                Editor
                            </span>
                            
                            <span *ngIf="sidebarType === 'expression'">
                                Expression
                            </span>
                            This is the right sidebar content
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

    private sidebarType: SidebarType;

    constructor(private guiEditorService: GuiEditorService) {
        this.guiEditorService.publishedSidebarEvents.subscribe((event: ShowSidebarEvent) => {
            this.sidebarType = event.data.sidebarType;
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
