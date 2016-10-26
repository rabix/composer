import {Component, OnInit, OnDestroy} from "@angular/core";
import {Validators, FormBuilder, FormGroup} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import {ExpressionModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService, InputInspectorData} from "../../../services/sidebars/input-sidebar.service";
import {Subject} from "rxjs/Subject";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {BehaviorSubject} from "rxjs";
import {Expression} from "cwlts/mappings/d2sb/Expression";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent
    ],
    template: `
            <form class="input-inspector-component object-inspector" *ngIf="selectedProperty">
                <div>
                     <span class="edit-text">Edit</span>
                    <i class="fa fa-info-circle info-icon"></i>
                </div>
            
                <div class="form-group">
                    <label for="inputId">ID</label>
                    <input type="text" 
                           name="selectedPropertyId" 
                           id="inputId" 
                           class="form-control"
                           [(ngModel)]="selectedProperty.id">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    
                    <select class="form-control" 
                            name="selectedPropertyType" 
                            id="dataType"
                            [(ngModel)]="selectedProperty.type" required>
                        <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                            {{propertyType}}
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Value</label>
                    
                    <expression-input *ngIf="expressionInputForm && expressionInputForm.controls['expressionInput']"
                                    [(expression)]="expressionInput"
                                    [control]="expressionInputForm.controls['expressionInput']"
                                    (onSelect)="addExpression()">
                    </expression-input>
                    
                </div>
            </form>
    `
})
export class InputInspectorComponent implements OnInit, OnDestroy {

    public context: any;

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    private inputBinding: Subject<string | Expression> = new Subject<string | Expression>();

    private expressionInput: ExpressionModel = new ExpressionModel(undefined);

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    private subs: Subscription[];

    private expressionInputSub: Subscription;

    private expressionInputForm: FormGroup;

    constructor(private formBuilder: FormBuilder,
                private inputSidebarService: InputSidebarService,
                private expressionSidebarService: ExpressionSidebarService) {
        this.subs = [];
    }

    ngOnInit(): void {
        this.subs.push(
            this.inputSidebarService.inputPortDataStream.subscribe((data: InputInspectorData) => {
                this.selectedProperty = data.inputProperty;
                this.context = data.context;
                const valueFrom = this.selectedProperty.getValueFrom();

                if (valueFrom === undefined) {
                    this.inputBinding.next("");
                } else {
                    this.inputBinding.next(valueFrom);
                }
            })
        );

        this.subs.push(
            this.inputBinding
                .filter(expression => expression !== undefined)
                .subscribe((expression: string | Expression) => {
                    let codeToEvaluate: string = "";
                    if ((<Expression>expression).script) {
                        codeToEvaluate = (<Expression>expression).script;
                        this.expressionInput.setValueToExpression(codeToEvaluate);
                    } else {
                        codeToEvaluate = <string>expression;
                        this.expressionInput.setValueToString(codeToEvaluate);
                    }

                    this.createExpressionInputForm(this.expressionInput.getExpressionScript());
                })
        );
    }

    private addExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((newExpression: ExpressionModel) => {
                this.selectedProperty.setValueFrom(newExpression.serialize());

                if ((<Expression>newExpression.serialize()).script) {
                    this.expressionInput = newExpression;
                    this.createExpressionInputForm(this.expressionInput.getExpressionScript())
                } else {
                    this.inputBinding.next(newExpression.serialize());
                }
            });

        this.expressionSidebarService.openExpressionEditor({
            expression: this.expressionInput,
            newExpressionChange: newExpression,
            context: this.context
        });
    }

    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    private createExpressionInputForm(formValue: string) {

        if (this.expressionInputForm && this.expressionInputForm.controls['expressionInput']) {
            this.expressionInputForm.controls['expressionInput'].setValue(formValue);
        } else {
            this.expressionInputForm = this.formBuilder.group({
                ['expressionInput']: [formValue, Validators.compose([Validators.required, Validators.minLength(1)])]
            });

            const inputValueChange = this.expressionInputForm.controls['expressionInput'].valueChanges.subscribe((value) => {
                if (typeof this.expressionInput.serialize() === "string") {
                    this.expressionInput.setValueToString(value);
                    this.selectedProperty.setValueFrom(value);
                }
            });

            this.subs.push(inputValueChange);
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
