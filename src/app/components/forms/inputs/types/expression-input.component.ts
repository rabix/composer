import {Component, Input, Output, EventEmitter} from "@angular/core";
import {AbstractControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {Expression} from "cwlts/mappings/d2sb/Expression";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    template: `
            <div class="input-group" *ngIf="control">
            
            <!--TODO: [disabled]="disabled" -->
                <input class="form-control"
                        (keyup)="modelChange($event)"
                        [formControl]="control"
                        [readonly]="expression.serialize().script ? 'true' : null"/>
                    
                <span class="input-group-btn">
                    <button type="button" 
                        class="btn btn-secondary" 
                        (click)="openExpressionSidebar()"><i class="fa fa-code"></i></button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    @Input()
    public disabled: boolean;

    @Input()
    public control: AbstractControl;

    @Input()
    public expression: ExpressionModel;

    @Input()
    public context: any;

    @Output()
    public expressionChange: EventEmitter<string | ExpressionModel> = new EventEmitter<string | ExpressionModel>();

    @Output()
    public onSelect = new EventEmitter();

    private openExpressionSidebar(): void {
        this.onSelect.emit();
    }

    private modelChange() {
        //Only emit if the value was not set to an expression
        if (!(<Expression>this.expression.serialize()).script) {
            this.expressionChange.emit(this.expression);
        }
    }
}
