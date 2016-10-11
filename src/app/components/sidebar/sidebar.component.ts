import {Component, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {ExpressionEditorSidebarComponent} from "./expression-editor/expression-editor-sidebar.component";
import {InputInspectorSidebarComponent} from "./object-inpsector/input-inspector-sidebar.component";
import {ToolSidebarService, SidebarType} from "../../services/sidebars/tool-sidebar.service";

require("./editor.component.scss");

@Component({
    selector: "sidebar-component",
    directives: [
        InputInspectorSidebarComponent,
        ExpressionEditorSidebarComponent,
    ],
    template: `
            <div [ngClass]="{show: show}" class="sidebar-container">
                <input-inspector-sidebar-component class="tool-sidebar"
                                                    [hidden]="currentSidebar !== 'input-inspector'">
                </input-inspector-sidebar-component>
                
                <expression-editor-sidebar-component class="tool-sidebar" 
                                                    [hidden]="currentSidebar !== 'expression-sidebar'">
                </expression-editor-sidebar-component>
            </div>
    `
})
export class SidebarComponent implements OnDestroy {

    private currentSidebar: SidebarType;

    private show = false;

    private subs: Subscription[];

    constructor(private toolSidebarService: ToolSidebarService) {

        this.subs = [];

        this.subs.push(
            this.toolSidebarService.sidebarStackStream.subscribe((sidebarStack: SidebarType[]) => {
                this.currentSidebar = sidebarStack.length > 0 ? sidebarStack[0] : undefined;
                this.setSidebarState();
            })
        );
    }

    private setSidebarState(): void {
        this.show = this.currentSidebar !== undefined;
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
