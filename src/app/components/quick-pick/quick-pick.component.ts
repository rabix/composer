import {Component, Input, Output} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ExpressionInputComponent} from "../forms/inputs/types/expression-input.component";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../common/component-base";
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {CustomValidators} from "../../validators/custom.validator";

require("./quick-pick.component.scss");

@Component({
    selector: "quick-pick",
    directives: [
        ExpressionInputComponent
    ],
    template: `
        <form [formGroup]="formGroup"
             class="button-list content-wrapper"
             *ngIf="!formGroup.controls['expressionField'] && formGroup.controls['radioButtonControl']">
        
           <div class="btn-group" data-toggle="buttons">
                
                <label *ngFor="let buttonLabel of buttonList" 
                       [ngClass]="{'active': buttonLabel === formGroup.controls['radioButtonControl'].value}"
                       class="btn btn-secondary button-item-label">
                       
                        <input type="radio"
                               formControlName="radioButtonControl"
                               [value]="buttonLabel">
                               {{buttonLabel}}
                </label>
          </div>
         
          <button type="button" 
                  class="btn btn-primary add-expression-btn"
                  *ngIf="!formGroup.controls['expressionField']"
                  (click)="crateExpressionInput()">Add Expression</button>
        </form>
        
        
        <div class="expression-input-wrapper content-wrapper"
             *ngIf="formGroup.controls['expressionField']">
             
             <expression-input class="col-sm-11 expression-input"
                    [context]="context"
                    [formControl]="formGroup.controls['expressionField']">
             </expression-input>
            
            <span class="col-sm-1">
                <i class="fa fa-trash clear-icon" (click)="removeExpressionInput()"></i>
            </span>
        </div>
    `
})
export class QuickPickComponent extends ComponentBase {

    @Input()
    public buttonList: String[];

    @Input()
    public context: any;

    @Input()
    private formGroup: FormGroup;

    @Output()
    public onUpdate = new ReplaySubject<string | Expression>(1);

    constructor() {
        super();
    }

    ngOnInit() {
        this.formGroup.addControl(
            "radioButtonControl", new FormControl("")
        );

        this.tracked = this.formGroup.controls["radioButtonControl"].valueChanges.subscribe((value: string) => {
            this.onUpdate.next(value);
        });
    }

    private crateExpressionInput(): void {
        if (this.formGroup.contains("expressionField")) {
            return;
        }

        this.formGroup.controls["radioButtonControl"].setValue("");
        const expressionModel = new ExpressionModel("");

        this.formGroup.addControl(
            "expressionField",
            new FormControl(expressionModel, [Validators.required, CustomValidators.cwlModel])
        );

        this.tracked = this.formGroup.controls["expressionField"].valueChanges
            .subscribe((expressionModel: ExpressionModel) => {
                this.onUpdate.next(expressionModel.serialize());
            });
    }

    private removeExpressionInput(): void {
        this.clearExpression();
        this.formGroup.removeControl("expressionField");
    }

    private clearExpression(): void {
        this.formGroup.controls["expressionField"].setValue(new ExpressionModel(""));
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
