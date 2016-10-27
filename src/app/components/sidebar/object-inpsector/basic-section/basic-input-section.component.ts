import {Component, OnInit, Input} from "@angular/core";
import {Validators, FormBuilder, FormGroup} from "@angular/forms";
import {ExpressionModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpressionSidebarService} from "../../../../services/sidebars/expression-sidebar.service";
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {SandboxService} from "../../../../services/sandbox/sandbox.service";
import {BasicInputSectionComponent} from "../basic-section/basic-input-section.component";
import {ToggleComponent} from "../../../common/toggle-slider/toggle-slider.component";
import {InputInspectorData, InputSidebarService} from "../../../../services/sidebars/input-sidebar.service";

require("./basic-input-section.component.scss");

@Component({
    selector: "basic-input-section",
    directives: [
        ToggleComponent
    ],
    template: `
          <form class="basic-input-section" *ngIf="selectedProperty">
                <div class="section-text">
                     <span>Basic</span>
                </div>
            
                <div class="form-group flex-container">
                    <label>Required</label>
                    
                    <span class="align-right">
                        {{selectedProperty.isRequired ? "Yes" : "No"}}
                       
                        <toggle-slider [(checked)]="selectedProperty.isRequired"></toggle-slider>
                    </span>
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
                
                <div class="form-group" [formGroup]="expressionInputForm">
                    <label>Value</label>
                    
                    <expression-input *ngIf="expressionInputForm && expressionInputForm.controls['expressionInput']"
                                    [disableEdit]="!hasInputBinding"
                                    [control]="expressionInputForm.controls['expressionInput']"
                                    (onSelect)="addExpression()">
                    </expression-input>
                </div>
                
                <div class="form-group flex-container">
                    <label>Include in command line</label>
                    
                    <span class="align-right">
                        {{hasInputBinding ? "Yes" : "No"}}
                        <toggle-slider [(checked)]="hasInputBinding"
                                        (checkedChange)="toggleInputBinding(hasInputBinding)"></toggle-slider>
                    </span>
                </div>
            </form>
    `
})
export class BasicInputSectionComponent implements OnInit {

    /** The currently displayed property */
    @Input()
    public selectedProperty: InputProperty;

    @Input()
    public context: any;

    /** The current expression model */
    private expressionModel: ExpressionModel;

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    private subs: Subscription[] = [];

    private expressionInputSub: Subscription;

    private expressionInputForm: FormGroup;

    private sandboxService: SandboxService;

    private hasInputBinding: boolean = false;

    constructor(private formBuilder: FormBuilder,
                private expressionSidebarService: ExpressionSidebarService,
                private inputSidebarService: InputSidebarService) {
        this.subs = [];
        this.sandboxService = new SandboxService();
    }

    ngOnInit(): void {
        this.hasInputBinding = this.selectedProperty.hasInputBinding();

        this.subs.push(
            this.inputSidebarService.inputPortDataStream.subscribe((data: InputInspectorData) => {
                this.selectedProperty = data.inputProperty;
                this.context = data.context;
                const valueFrom = this.selectedProperty.getValueFrom();

                if (valueFrom === undefined) {
                    this.createExpressionInputForm("");
                } else {
                    this.createExpressionInputForm(valueFrom);
                }
            })
        );
    }

    private addExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((newExpression: ExpressionModel) => {
                this.updateExpressionInputValue(newExpression.serialize());
            });

        this.expressionSidebarService.openExpressionEditor({
            expression: new ExpressionModel(this.selectedProperty.getValueFrom()),
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

    private createExpressionInputForm(expression: string | Expression) {
        this.expressionModel = new ExpressionModel(expression);
        this.setSelectedProperty(expression);

        this.expressionInputForm = this.formBuilder.group({
            'expressionInput': [
                {value: this.expressionModel.getExpressionScript(), disabled: !this.hasInputBinding},
                Validators.compose([Validators.required, Validators.minLength(1)])
            ]
        });

        this.listenToInputChanges();
    }

    private updateExpressionInputValue(expression: string | Expression) {
        this.expressionModel = new ExpressionModel(expression);

        if (this.expressionInputForm && this.expressionInputForm.controls['expressionInput']) {
            this.expressionInputForm.controls['expressionInput'].setValue(this.expressionModel.getExpressionScript());
        }
    }

    private listenToInputChanges(): void {
        const inputValueChange = this.expressionInputForm.controls['expressionInput'].valueChanges.subscribe((value) => {
            if ((<Expression>this.expressionModel.serialize()).script) {
                this.expressionInputForm.controls['expressionInput'].disable({
                    onlySelf: true,
                    emitEvent: false
                });
            } else {
                this.expressionModel.setValueToString(value);
                this.expressionInputForm.controls['expressionInput'].enable({
                    onlySelf: true,
                    emitEvent: false
                });
            }

            this.setSelectedProperty(this.expressionModel.serialize());
        });

        this.subs.push(inputValueChange);
    }

    private setSelectedProperty(value: string | Expression) {
        if (this.hasInputBinding) {
            this.selectedProperty.setValueFrom(value);
        }
    }

    private toggleInputBinding(hasBinding: boolean) {
        if (!hasBinding) {
            this.updateExpressionInputValue("");
            this.selectedProperty.removeInputBinding();
            this.expressionInputForm.controls['expressionInput'].disable();
        } else {
            this.expressionInputForm.controls['expressionInput'].enable();
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
