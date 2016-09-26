import {Component, OnDestroy} from "@angular/core";
import {Subscription} from "rxjs/Subscription";
import {
    OpenInputInspector,
    CloseInputInspector,
    OpenExpressionEditor,
    CloseExpressionEditor
} from "../../action-events/index";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {ExpressionEditorSidebarComponent} from "./expression-editor/expression-editor-sidebar.component";
import {InputInspectorSidebarComponent} from "./object-inpsector/input-inspector-sidebar.component";

require ("./editor.component.scss");

declare type sidebarType = "input-inspector" | "expression-editor";

@Component({
    selector: "sidebar-component",
    directives: [
        InputInspectorSidebarComponent,
        ExpressionEditorSidebarComponent
    ],
    template: `
            <div [ngClass]="{show: show}">
                <input-inspector-sidebar-component class="tool-sidebar" 
                                                  [ngClass]="{'top-of-stack': currentSidebar === 'input-inspector'}">
                </input-inspector-sidebar-component>
                
                <expression-editor-sidebar-component class="tool-sidebar" 
                                                    [ngClass]="{'top-of-stack': currentSidebar === 'expression-editor'}">
                </expression-editor-sidebar-component>
            </div>
    `
})
export class SidebarComponent implements OnDestroy {

    private currentSidebar: sidebarType;

    private closeSidebarActions = [];

    private show = false;
    
    private subs: Subscription[];

    constructor(private eventHubService: EventHubService) {
        this.subs = [];

        this.initInputInspectorListener();
        this.initExpressionEditorListener();
    }

    //TODO (Mate): make this simpler
    private initInputInspectorListener(): void {
        this.subs.push(this.eventHubService.on(OpenInputInspector).subscribe(() => {
            this.closeSidebarActions.push(CloseInputInspector);
            this.currentSidebar = "input-inspector";
            this.setSidebarState();
        }));

        this.subs.push(this.eventHubService.on(CloseInputInspector).subscribe(() => {
            this.deleteSidebarActionFromArray(CloseInputInspector);
            this.currentSidebar = this.closeSidebarActions[0] === CloseExpressionEditor ? "expression-editor" : undefined;
            this.setSidebarState();
        }));
    }

    private initExpressionEditorListener(): void {
        this.subs.push(this.eventHubService.on(OpenExpressionEditor).subscribe(() => {
            this.closeSidebarActions.push(CloseExpressionEditor);
            this.currentSidebar = "expression-editor";
            this.setSidebarState();
        }));

        this.subs.push(this.eventHubService.on(CloseExpressionEditor).subscribe(() => {
            this.deleteSidebarActionFromArray(CloseExpressionEditor);
            this.currentSidebar = this.closeSidebarActions[0] === CloseInputInspector ? "input-inspector" : undefined;
            this.setSidebarState();
        }));
    }

    private deleteSidebarActionFromArray(action): void {
        this.closeSidebarActions = this.closeSidebarActions.filter(sidebarAction => {
            return sidebarAction !== action;
        });
    }

    private setSidebarState(): void {
        this.show = this.closeSidebarActions.length !== 0;
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
