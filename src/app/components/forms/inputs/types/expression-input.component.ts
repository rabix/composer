import {Component, Input, Output, EventEmitter} from "@angular/core";
import {AbstractControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";

require("./expression-input.component.scss");

@Component({
    selector: 'expression-input',
    template: `
            <div class="input-group" *ngIf="control">
                <input class="form-control"
                        (keyup)="modelChange($event)"
                        [formControl]="control"/>
                    
                <span class="input-group-btn">
                    <button type="button" 
                        [disabled]="control.disabled"
                        class="btn btn-secondary" 
                        (click)="openExpressionSidebar()"><i class="fa fa-code"></i></button>
                </span>
            </div>
        `
})
export class ExpressionInputComponent {

    @Input()
    public control: AbstractControl;

    @Input()
    public expression: ExpressionModel;

    @Output()
    public onSelect = new EventEmitter();

    private openExpressionSidebar(): void {
        this.onSelect.emit();
    }
}
