import {
    Component,
    style,
    animate,
    state,
    transition,
    trigger,
    EventEmitter,
    Output
} from "@angular/core";
import {NgFor} from "@angular/common";
import {GuiEditorService, SidebarType, GuiEditorEvent, GuiEditorEventType,ShowSidebarEvent} from "../gui-editor.service";
import {VisibilityState} from "../animation.states";

require ("./editor-sidebar.component.scss");

/** TODO: make this switch between an expression editor and an object inspector*/
@Component({
    selector: "editor-sidebar",
    directives: [NgFor],
    animations: [
        trigger("sidebarState", [
            state("visible", style({
                width: '40%',
                display: 'block',
                overflowY: "auto"
            })),
            state("hidden", style({
                width: '10%',
                display: 'none',
                overflowY: "hidden"
            })),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    template: `
                    <div class="rightSidebar" @sidebarState="sidebarState">
                        <div class="collapseIcon">
                            <i class="fa fa-lg fa-caret-left" (click)="collapseSidebar()"></i>
                        </div>
                        <div class="sideBarContent">
                            <!-- TODO: add expression and objects editor -->
                            This is the right sidebar content
                        </div>
                    </div>
    `
})
export class EditorSidebarComponent {
    /** Emit changes of the sidebar animation to the parent component */
    @Output()
    private sidebarVisibility = new EventEmitter();

    /** State of the sidebar animation */
    private sidebarState: VisibilityState = "hidden";

    constructor(private guiEditorService: GuiEditorService) {
        const self = this;

        this.guiEditorService.publishedEditorEvents.subscribe((event: GuiEditorEvent) => {
            if (event.type === GuiEditorEventType.showSidebar) {
                let showSidebarEvent: ShowSidebarEvent = <ShowSidebarEvent>event;
                self.showSideBar(showSidebarEvent.data.sidebarType);
            }
        });
    }

    showSideBar(sidebarType: SidebarType): void {
        this.sidebarState = "visible";
        this.sidebarVisibility.emit(this.sidebarState);
    }

    collapseSidebar() {
        this.sidebarState = "hidden";
        this.sidebarVisibility.emit(this.sidebarState);
    }
}
