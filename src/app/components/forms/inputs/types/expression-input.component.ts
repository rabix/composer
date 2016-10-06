import {Component, Input, Output, EventEmitter} from "@angular/core";
import {REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, AbstractControl} from "@angular/forms";
import {BaseCommand} from "../../../../services/base-command/base-command.service";
import {ExpressionModel} from "cwlts/lib/models/d2sb";

require("./expression-input.component.scss");

export type ExpressionInputType = "baseCommands" | "inputPortValue";

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
                        [readonly]="value.expressionValue ? 'true' : null"/>
                    
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
    public value: BaseCommand;

    @Output()
    public valueChange: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    public onSelect = new EventEmitter();

    private openExpressionSidebar(): void {
        this.onSelect.emit();
    }

    private modelChange(event: any) {
        //Only emit if the value was not set to an expression
        if (!(<ExpressionModel>this.value).expressionValue) {
            this.valueChange.emit(event.target.value);
        }
    }
}
