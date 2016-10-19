import {Component, OnInit, OnDestroy} from "@angular/core";
import {Validators, FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {ExpressionInputComponent} from "../../forms/inputs/types/expression-input.component";
import {ExpressionModel} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {InputSidebarService} from "../../../services/sidebars/input-sidebar.service";
import {Subject} from "rxjs/Subject";
import {ExpressionSidebarService} from "../../../services/sidebars/expression-sidebar.service";
import {BehaviorSubject} from "rxjs";
import {InputPropertyViewModel} from "../../../services/input-port/input-port.service";
import {Expression} from "cwlts/mappings/d2sb/Expression";

require("./input-inspector.component.scss");

@Component({
    selector: "input-inspector",
    directives: [
        ExpressionInputComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
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
                           [(ngModel)]="selectedProperty.inputProperty.id">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    
                    <select class="form-control" 
                    name="selectedPropertyType" 
                    id="dataType"
                    [(ngModel)]="selectedProperty.inputProperty.type" required>
                        <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                            {{propertyType}}
                        </option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Value</label>
                    
                    <expression-input *ngIf="expressionInputForm.controls['expressionInput']"
                                    [(expression)]="expressionInput"
                                    [control]="expressionInputForm.controls['expressionInput']"
                                    (onSelect)="addExpression()">
                    </expression-input>
                    
                </div>
            </form>
    `
})
export class InputInspectorComponent implements OnInit, OnDestroy {

    /** The currently displayed property */
    private selectedProperty: InputPropertyViewModel;

    private inputBinding: Subject<string | ExpressionModel> = new Subject<string | ExpressionModel>();

    private expressionInput: ExpressionModel;

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
            this.inputSidebarService.inputPortDataStream.subscribe((inputVm: InputPropertyViewModel) => {
                this.selectedProperty = inputVm;
                this.inputBinding.next(new ExpressionModel({
                    value: this.selectedProperty.inputProperty.getValueFrom(),
                    evaluatedValue: this.selectedProperty.value
                }));
            })
        );

        this.subs.push(
            this.inputBinding.subscribe((expressionModel: ExpressionModel) => {
                this.expressionInput = expressionModel;
                const formValue: string = expressionModel.getEvaluatedValue();

                if (this.expressionInputForm && this.expressionInputForm.controls['expressionInput']) {
                    this.expressionInputForm.controls['expressionInput'].setValue(formValue);
                } else {
                    this.expressionInputForm = this.formBuilder.group({
                        ['expressionInput']: [formValue, Validators.compose([Validators.required, Validators.minLength(1)])]
                    });
                }

                this.expressionInputForm.controls['expressionInput'].valueChanges.subscribe((value) => {
                    if (typeof this.expressionInput.serialize() === "string") {
                        this.expressionInput.setValueToString(value);
                        this.expressionInput.setEvaluatedValue(value);

                        this.selectedProperty.value = value;
                        this.selectedProperty.inputProperty.setValueFrom(value);
                    }
                });

            })
        );
    }

    private addExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((newExpression: ExpressionModel) => {
                if ((<Expression>newExpression.serialize()).script) {
                    this.selectedProperty.value = newExpression.getEvaluatedValue();
                    this.selectedProperty.inputProperty.setValueFrom(newExpression.serialize());
                }
                this.inputBinding.next(newExpression);
            });

        this.expressionSidebarService.openExpressionEditor({
            expression: this.expressionInput.getExpressionScript(),
            newExpressionChange: newExpression
        });
    }

    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
