import {Component, Input, Output, EventEmitter} from "@angular/core";
import {AbstractControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {Expression} from "cwlts/mappings/d2sb/Expression";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    template: `
            <div class="input-group"
                 [class.expression-input-group]="expression.serialize().script"
                 *ngIf="control">
                <input class="form-control"
                        (keyup)="modelChange($event)"
                        [formControl]="control"
                        (click)="editExpression($event)"
                        [readonly]="expression.serialize().script ? 'true' : null"/>
                    
                <span class="input-group-btn">
                    <button type="button" 
                        class="btn btn-secondary" 
                        (click)="onClick()">
                        <i class="fa"
                            [ngClass]="{'fa-times': expression.serialize().script,
                                        'fa-code': !expression.serialize().script}"></i>
                    </button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    @Input()
    public control: AbstractControl;

    @Input()
    public expression: ExpressionModel;

    @Input()
    public context: any;

    @Output()
    public expressionChange: EventEmitter<string | ExpressionModel> = new EventEmitter<string | ExpressionModel>();

    @Output()
    public onEdit = new EventEmitter();

    @Output()
    public onClear = new EventEmitter();

    private editExpression(event?: Event): void {
        if (event) {
            event.stopPropagation();
        }

        if ((<Expression>this.expression.serialize()).script) {
            this.onEdit.emit();
        }
    }

    private onClick(): void {
        if ((<Expression>this.expression.serialize()).script) {
            this.onClear.emit();
        } else {
            this.onEdit.emit();
        }
    }

    private modelChange() {
        //Only emit if the value was not set to an expression
        if (!(<Expression>this.expression.serialize()).script) {
            this.expressionChange.emit(this.expression);
        }
    }
}
