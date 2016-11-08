import {Component, Input, Output} from "@angular/core";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ExpressionInputComponent} from "../forms/inputs/types/expression-input.component";
import {ExpressionModel} from "cwlts/models/d2sb";
import {BehaviorSubject, Subscription, ReplaySubject} from "rxjs";
import {ExpressionSidebarService} from "../../services/sidebars/expression-sidebar.service";

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
                      [control]="formGroup.controls['expressionField']"
                      [isExpression]="!!expressionModel.serialize().script"
                      (onEdit)="editExpression()"
                      (onClear)="clearExpression()">
            </expression-input>
            
            <span class="col-sm-1">
                <i class="fa fa-trash clear-icon" (click)="removeExpressionInput()"></i>
            </span>
        </div>
    `
})
export class QuickPickComponent {

    @Input()
    public buttonList: String[];

    @Input()
    public context: any;

    @Input()
    private formGroup: FormGroup;

    @Output()
    public onUpdate = new ReplaySubject<string>(1);

    private expressionModel: ExpressionModel;

    private expressionInputSub: Subscription;

    private subs: Subscription[] = [];

    constructor(private expressionSidebarService: ExpressionSidebarService) {

    }

    ngOnInit() {
        this.formGroup.addControl(
            "radioButtonControl", new FormControl("")
        );

        this.subs.push(
            this.formGroup.controls["radioButtonControl"].valueChanges.subscribe((value: string) => {
                this.onUpdate.next(value);
            })
        );
    }

    private crateExpressionInput(): void {
        if (this.formGroup.contains("expressionField")) {
            return;
        }

        this.formGroup.controls["radioButtonControl"].setValue("");
        this.expressionModel = new ExpressionModel("");

        this.formGroup.addControl(
            "expressionField",
            new FormControl(this.expressionModel.serialize(), Validators.compose([Validators.required, Validators.minLength(1)]))
        );

        this.subs.push(
            this.formGroup.controls["expressionField"].valueChanges
                .debounceTime(300)
                .subscribe((value: string) => {
                    this.updateExpressionValue(new ExpressionModel(value));
                })
        );
    }

    private removeExpressionInput(): void {
        this.clearExpression();
        this.formGroup.removeControl("expressionField");
    }

    private editExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((expression: ExpressionModel) => {
                this.updateExpressionValue(expression);

                this.formGroup.controls["expressionField"].setValue(
                    this.expressionModel.getExpressionScript(), {
                        onlySelf: true,
                        emitEvent: false,
                    });
            });

        this.expressionSidebarService.openExpressionEditor({
            expression: this.expressionModel,
            newExpressionChange: newExpression,
            context: this.context
        });
    }

    private clearExpression(): void {
        this.expressionModel.setValueToString("");
        this.formGroup.controls["expressionField"].setValue(this.expressionModel.getExpressionScript());
    }

    private updateExpressionValue(expressionModel: ExpressionModel) {
        this.expressionModel = expressionModel;
        this.onUpdate.next(this.expressionModel.getExpressionScript());
    }

    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    ngOnDestroy(): void {
        this.removeExpressionInputSub();
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
