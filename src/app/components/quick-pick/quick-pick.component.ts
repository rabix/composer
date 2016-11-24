import {Component, Input, forwardRef} from "@angular/core";
import {FormControl, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {ExpressionInputComponent} from "../../editor-common/components/expression-input/expression-input.component";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {CustomValidators} from "../../validators/custom.validator";
import {Expression} from "cwlts/mappings/d2sb/Expression";

require("./quick-pick.component.scss");

@Component({
    selector: "quick-pick",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => QuickPickComponent), multi: true }
    ],
    directives: [
        ExpressionInputComponent
    ],
    template: `
           <div class="btn-group" data-toggle="buttons" *ngIf="!expressionControl">
                
                <label *ngFor="let buttonLabel of buttonList" 
                       [ngClass]="{'active': buttonLabel === radioButtonControl.value}"
                       class="btn btn-secondary button-item-label">
                       
                        <input type="radio"
                               [formControl]="radioButtonControl"
                               [value]="buttonLabel">
                               {{buttonLabel}}
                </label>
          </div>
         
          <button type="button" 
                  class="btn btn-primary add-expression-btn"
                  *ngIf="!expressionControl"
                  (click)="crateExpressionInput('')">Add Expression</button>
        
        <div class="expression-input-wrapper content-wrapper"
             *ngIf="expressionControl">
             
             <expression-input class="col-sm-11 expression-input"
                    [context]="context"
                    [formControl]="expressionControl">
             </expression-input>
            
            <span class="col-sm-1">
                <i class="fa fa-trash clear-icon" (click)="removeExpressionInput()"></i>
            </span>
        </div>
    `
})
export class QuickPickComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public buttonList: String[];

    @Input()
    public context: any;

    private radioButtonControl: FormControl;

    private expressionControl: FormControl;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    constructor() {
        super();
        this.radioButtonControl = new FormControl("");

        this.tracked = this.radioButtonControl.valueChanges.subscribe((value: string) => {
            this.propagateChange(value);
        });
    }

    private writeValue(value: string | ExpressionModel): void {
        if (typeof value === "string") {
            const index = this.buttonList.indexOf(<string>value);

            if (index > -1) {
                this.radioButtonControl.setValue(this.buttonList[index]);
            } else {
                this.crateExpressionInput(value);
            }

        } else {
            this.crateExpressionInput(value);
        }
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private crateExpressionInput(value: string | ExpressionModel): void {
        let expressionModel = new ExpressionModel(null, "");
        this.radioButtonControl.setValue("");

        if (typeof value === "string") {
            expressionModel.setValue(value, "string")
        } else {
            expressionModel.setValue((<Expression>value).script, "expression");
        }

        this.expressionControl = new FormControl(expressionModel, [Validators.required, CustomValidators.cwlModel]);

        this.tracked = this.expressionControl.valueChanges
            .subscribe((expressionModel: ExpressionModel) => {
                this.propagateChange(expressionModel.serialize());
            });
    }

    private removeExpressionInput(): void {
        this.clearExpression();
        this.expressionControl = undefined;
    }

    private clearExpression(): void {
        this.expressionControl.setValue(new ExpressionModel(null, ""));
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
