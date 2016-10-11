import {Component, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {ExpressionEditorSidebarComponent} from "./expression-editor/expression-editor-sidebar.component";
import {InputInspectorSidebarComponent} from "./object-inpsector/input-inspector-sidebar.component";
import {ExpressionSidebarService} from "../../services/sidebars/expression-sidebar.service";
import {InputSidebarService} from "../../services/sidebars/input-sidebar.service";

require("./editor.component.scss");

declare type sidebarType = "input-inspector" | "expression-editor";

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
                                                    [hidden]="currentSidebar !== 'expression-editor'">
                </expression-editor-sidebar-component>
            </div>
    `
})
export class SidebarComponent implements OnDestroy {

    private currentSidebar: sidebarType;

    private sidebarStack = [];

    private show = false;

    private subs: Subscription[];

    constructor(private expressionSidebarService: ExpressionSidebarService,
                private inputSidebarService: InputSidebarService) {
        this.subs = [];

        this.initInputInspectorListener();
        this.initExpressionEditorListener();
    }

    //TODO (Mate): move this to a service
    private initInputInspectorListener(): void {
        this.inputSidebarService.isOpen.subscribe((isOpen: boolean) => {
            if (isOpen) {
                if (this.sidebarStack.indexOf("input-inspector") === -1) {
                    this.sidebarStack.unshift("input-inspector");
                }
                this.currentSidebar = "input-inspector";
                this.setSidebarState();
            } else {
                this.removeSidebarFromStack("input-inspector");
                this.currentSidebar = this.sidebarStack.length > 0 ? this.sidebarStack[0] : undefined;
                this.setSidebarState();
            }
        });
    }

    private initExpressionEditorListener(): void {
        this.expressionSidebarService.isOpen.subscribe((isOpen: boolean) => {
            if (isOpen) {
                if (this.sidebarStack.indexOf("expression-editor") === -1) {
                    this.sidebarStack.unshift("expression-editor");
                }
                this.currentSidebar = "expression-editor";
                this.setSidebarState();
            } else {
                this.removeSidebarFromStack("expression-editor");
                this.currentSidebar = this.sidebarStack.length > 0 ? this.sidebarStack[0] : undefined;
                this.setSidebarState();
            }
        });
    }

    private removeSidebarFromStack(sidebar): void {
        this.sidebarStack = this.sidebarStack.filter(sidebarName => {
            return sidebarName !== sidebar;
        });
    }

    private setSidebarState(): void {
        this.show = this.sidebarStack.length !== 0;
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
