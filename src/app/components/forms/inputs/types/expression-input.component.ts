import {Component, Input, Output, EventEmitter} from "@angular/core";
import {FormControl, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {CltEditorService} from "../../../clt-editor/shared/clt-editor.service";
import {SidebarEvent, SidebarEventType} from "../../../sidebar/shared/sidebar.events";
import {SidebarType} from "../../../sidebar/shared/sidebar.type";
import {BehaviorSubject} from "rxjs";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <div class="input-group expression-input-group">
                <input #expressionInput 
                    (keyup)="onInputChange(expressionInput.value)"
                    name="expression"
                    type="text" 
                    class="form-control"
                    [formControl]="inputControl"
                    [(ngModel)]="expression">
                    
                <span class="input-group-addon add-expression">
                    <button type="button" 
                        class="btn btn-secondary expression-form-btn" 
                        (click)="openExpressionSidebar()">Add expression</button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {
    @Input()
    private expression: string;

    @Output()
    private expressionChange: EventEmitter<string> = new EventEmitter<string>();

    /** The form control passed from the parent */
    @Input()
    private inputControl: FormControl;

    constructor(private guiEditorService: CltEditorService) { }

    onInputChange(expression: string) {
        this.expressionChange.emit(expression);
    }

    openExpressionSidebar() {
        let expressionStream: BehaviorSubject<string> = new BehaviorSubject(this.expression);

        expressionStream.subscribe((expression) => {
            this.expression = expression;
            this.expressionChange.emit(this.expression);
        });

        let showSidebarEvent: SidebarEvent = {
            sidebarEventType: SidebarEventType.Show,
            sidebarType: SidebarType.Expression,
            data: {
                stream: expressionStream
            }
        };

        this.guiEditorService.publishSidebarEvent(showSidebarEvent);
    }
}
