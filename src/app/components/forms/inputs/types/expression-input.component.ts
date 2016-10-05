import {Component, Input, Output, EventEmitter} from "@angular/core";
import {REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, AbstractControl} from "@angular/forms";

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
                <input class="form-control" [formControl]="control"/>
                    
                <span class="input-group-addon add-expression" (click)="openExpressionSidebar()">
                    <i class="fa fa-2x fa-code expression-form-btn"></i>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    @Input()
    public control: AbstractControl;

    @Output()
    public onSelect = new EventEmitter();

    private openExpressionSidebar(): void {
        this.onSelect.emit();
    }
}
