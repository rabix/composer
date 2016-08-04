import {Component, Input} from "@angular/core";
import {FormControl, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {GuiEditorService} from "../../../gui-editor/shared/gui-editor.service";
import {ShowSidebarEvent} from "../../../gui-editor/shared/gui-editor.events";

require("./base-command-input.component.scss");

@Component({
    selector: 'base-command-input',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <div class="input-group base-command-input-group">
                <input name="baseCommand"
                    type="text" 
                    class="form-control"
                    [formControl]="inputControl"
                    [(ngModel)]="baseCommand">
                    
                <span class="input-group-addon add-expression">
                    <button type="button" 
                        class="btn btn-secondary base-command-form-btn" 
                        (click)="openExpressionSidebar()">Add expression</button>
                </span>
                    
            </div>
            <button type="button" class="btn btn-secondary base-command-form-btn">Add base command</button>
        `
})
export class BaseCommandInputComponent {
    @Input()
    private baseCommand: string;

    /** The form control passed from the parent */
    @Input()
    private inputControl: FormControl;

    constructor(private guiEditorService: GuiEditorService) { }

    openExpressionSidebar() {
        let showSidebarEvent: ShowSidebarEvent = {
            data: {
                sidebarType: "expression"
            }
        };

        this.guiEditorService.publishSidebarEvent(showSidebarEvent);
    }
}
