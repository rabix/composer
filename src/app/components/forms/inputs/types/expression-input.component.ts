import {Component, Input, OnDestroy} from "@angular/core";
import {FormControl, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {
    OpenExpressionEditor,
    UpdateBaseCommandExpression,
    UpdateInputPortExpression
} from "../../../../action-events/index";
import {ExpressionInputService} from "../../../../services/expression-input/expression-input.service";
import {Subscription} from "rxjs/Subscription";

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
export class ExpressionInputComponent implements OnDestroy {

    /** The form control passed from the parent */
    @Input()
    public inputControl: FormControl;

    @Input()
    public expressionType: any;

    private updateAction: any;

    private expressionInputService: ExpressionInputService;

    private subs: Subscription[];

    constructor(private eventHubService: EventHubService) {
        this.expressionInputService = new ExpressionInputService();
        this.subs = [];
    }

    private openExpressionSidebar(): void {
        this.expressionInputService.setExpression(this.inputControl.value);

        let updateExpressionValue = this.expressionInputService.expression.subscribe(expression => {
            this.inputControl.setValue(expression, {
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

        this.subs.push(updateExpressionValue);
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
