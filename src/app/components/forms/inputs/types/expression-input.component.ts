import {Component, Input, Output, EventEmitter} from "@angular/core";
import {AbstractControl} from "@angular/forms";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    template: `
            <div class="input-group"
                 [class.expression-input-group]="isExpression === true"
                 *ngIf="control">
                <input class="form-control"
                        [formControl]="control"
                        (click)="editExpression($event)"
                        [readonly]="isExpression === true"/>
                    
                <span class="input-group-btn">
                    <button type="button"
                        class="btn btn-secondary" 
                        [disabled]="disableEdit"
                        (click)="onClick($event)">
                        <i class="fa"
                            [ngClass]="{'fa-times': isExpression === true,
                                        'fa-code': isExpression === false}"></i>
                    </button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    @Input()
    public control: AbstractControl;

    @Input()
    public disableEdit: boolean;

    @Input()
    public isExpression: boolean;

    @Output()
    public onEdit = new EventEmitter();

    @Output()
    public onClear = new EventEmitter();

    private editExpression(event): void {
        event.stopPropagation();

        if (this.isExpression) {
            this.onEdit.emit();
        }
    }

    private onClick(event): void {
        event.stopPropagation();

        if (this.isExpression) {
            this.onClear.emit();
        } else {
            this.onEdit.emit();
        }
    }
}
