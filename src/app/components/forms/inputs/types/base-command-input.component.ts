import {Component, Input} from "@angular/core";
import {GuiEditorService, GuiEditorEventType, SidebarType} from "../../../gui-editor/gui-editor.service";

require("./base-command-input.component.scss");

@Component({
    selector: 'base-command-input',
    template: `
            <div class="input-group">
                <input name="baseCommand"
                    type="text" 
                    class="form-control"
                    [(ngModel)]="baseCommand">
                    
                <span class="input-group-addon addExpression">
                    <button type="button" 
                        class="btn btn-secondary baseCommandFormBtn" 
                        (click)="openExpressionSidebar()">Add expression</button>
                </span>
                    
            </div>
            <button type="button" class="btn btn-secondary baseCommandFormBtn">Add base command</button>
        `
})
export class BaseCommandInputComponent {
    @Input()
    private baseCommand: string;
    
    constructor(private guiEditorService: GuiEditorService) { }

    openExpressionSidebar() {
        this.guiEditorService.publishEditorEvent({
            type: GuiEditorEventType.showSidebar,
            data: {
                sidebarType: SidebarType.expression
            }
        });
    }
}
