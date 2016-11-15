import {Component} from "@angular/core";
import {ExpressionEditorComponent} from "./expression-editor.component";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";

@Component({
    selector: "expression-editor-sidebar-component",
    directives: [
        ExpressionEditorComponent
    ],
    template: `
            <div class="sidebar-component">
                    <expression-editor></expression-editor>
            </div>
    `
})
export class ExpressionEditorSidebarComponent {
    constructor(private expressionSidebarService: ExpressionSidebarService) { }

    private collapseSidebar(): void {
        this.expressionSidebarService.closeExpressionEditor();
    }
}
