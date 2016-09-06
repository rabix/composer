import {Component, Input} from "@angular/core";
import {FormControl, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {
    OpenExpressionEditor, 
    UpdateBaseCommandExpression,
    UpdateInputPortExpression
} from "../../../../action-events/index";
import {ExpressionInputService} from "../../../../services/expression-input/expression-input.service";

require("./expression-input.component.scss");

export type ExpressionInputType = "baseCommand" | "inputPortValue";

@Component({
    selector: 'expression-input',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <div class="input-group expression-input-group">
                <input class="form-control" [formControl]="inputControl"/>
                    
                <span class="input-group-addon add-expression">
                    <button type="button" 
                        class="btn btn-secondary expression-form-btn" 
                        (click)="openExpressionSidebar()">Add expression</button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    /** The form control passed from the parent */
    @Input()
    public inputControl: FormControl;

    @Input()
    public expressionType: any;

    private updateAction: any;

    constructor(private eventHubService: EventHubService,
                private expressionInputService: ExpressionInputService) { }

    private openExpressionSidebar(): void {
        this.expressionInputService.setExpression(this.inputControl.value);

        this.expressionInputService.expression.subscribe(expression => {
            this.inputControl.updateValue(expression, {
                onlySelf: false,
                emitEvent: true
            });
        });

        switch(this.expressionType) {
            case "baseCommand":
                this.updateAction = (expression) => new UpdateBaseCommandExpression(expression);
                break;
            case "inputPortValue":
                this.updateAction = (expression) => new UpdateInputPortExpression(expression);
                break;
        }

        this.eventHubService.publish(new OpenExpressionEditor({
            expression: this.expressionInputService.expression,
            updateAction: this.updateAction
        }));
    }
}
