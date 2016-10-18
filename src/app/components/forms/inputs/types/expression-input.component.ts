import {Component, Input, Output, EventEmitter} from "@angular/core";
import {REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, AbstractControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    directives: [
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    template: `
            <div class="input-group expression-input-group" *ngIf="control">
                <input class="form-control"
                        (keyup)="modelChange($event)"
                        [formControl]="control"
                        [readonly]="expression.script ? 'true' : null"/>
                    
                <span class="input-group-addon add-expression" (click)="openExpressionSidebar()">
                    <i class="fa fa-2x fa-code expression-form-btn"></i>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    @Input()
    public control: AbstractControl;

    @Input()
    public expression: string | ExpressionModel;

    @Output()
    public expressionChange: EventEmitter<string | ExpressionModel> = new EventEmitter<string | ExpressionModel>();

    @Output()
    public onSelect = new EventEmitter();

    private openExpressionSidebar(): void {
        this.onSelect.emit();
    }

    private modelChange(event: any) {
        //Only emit if the value was not set to an expression
        if (!(<ExpressionModel>this.expression).expressionValue) {
            this.expressionChange.emit(event.target.value);
        }
    }
}
