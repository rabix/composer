import {Component, OnInit, Input} from "@angular/core";
import {Validators, FormBuilder, FormGroup, FormControl} from "@angular/forms";
import {ExpressionModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {Subscription} from "rxjs/Subscription";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpressionSidebarService} from "../../../../services/sidebars/expression-sidebar.service";
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {SandboxService} from "../../../../services/sandbox/sandbox.service";
import {ToggleComponent} from "../../../common/toggle-slider/toggle-slider.component";
import {
    InputInspectorData,
    InputSidebarService
} from "../../../../services/sidebars/input-sidebar.service";

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
                            [(ngModel)]="selectedProperty.type.type" required>
                        <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                            {{propertyType}}
                        </option>
                    </select>
                </div>
                
     
                
                <div class="form-group flex-container">
                    <label>Include in command line</label>
                    
                    <span class="align-right">
                        {{selectedProperty.isBound ? "Yes" : "No"}}
                        <toggle-slider (checkedChange)="toggleInputBinding()"></toggle-slider>
                    </span>
                    
                    <div class="form-group" [formGroup]="expressionInputForm" *ngIf="selectedProperty.isBound">
                        <label>Value</label>
                        
                         <expression-input
                                        [context]="context"
                                        [formControl]="expressionInputForm.controls['expressionInput']">
                        </expression-input>
                </div>
                </div>
            </form>
    `
})
export class BasicInputSectionComponent implements OnInit {

    /** The currently displayed property */
    @Input()
    public selectedProperty: InputProperty;

    @Input()
    public context: {$job: any, $self: any};

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    private subs: Subscription[] = [];

    private expressionInputSub: Subscription;

    private expressionInputForm: FormGroup;

    private sandboxService: SandboxService;

    constructor(private formBuilder: FormBuilder,
                private expressionSidebarService: ExpressionSidebarService,
                private inputSidebarService: InputSidebarService) {
        this.subs = [];
        this.sandboxService = new SandboxService();
    }

    ngOnInit(): void {
        this.subs.push(
            this.inputSidebarService.inputPortDataStream.subscribe((data: InputInspectorData) => {
                this.selectedProperty = data.inputProperty;
                this.context          = data.context;
                let valueFrom = new ExpressionModel("");
                if (this.selectedProperty.isBound) {
                    valueFrom = this.selectedProperty.inputBinding.valueFrom;
                }

                // if (valueFrom === undefined) {
                //     this.createExpressionInputForm("");
                // } else {
                //     this.createExpressionInputForm(valueFrom);
                // }

                this.expressionInputForm  = this.formBuilder.group({
                    'expressionInput': new FormControl(valueFrom)
                });

                this.listenToInputChanges();
            })
        );


    }

    /** @deprecated */
    private addExpression(): void {
        const newExpression: BehaviorSubject<ExpressionModel> = new BehaviorSubject<ExpressionModel>(undefined);
        this.removeExpressionInputSub();

        this.expressionInputSub = newExpression
            .filter(expression => expression !== undefined)
            .subscribe((newExpression: ExpressionModel) => {
                this.updateExpressionInputValue(newExpression.serialize());
            });

        this.expressionSidebarService.openExpressionEditor({
            value: this.selectedProperty.inputBinding.valueFrom,
            newExpressionChange: newExpression,
            context: this.context
        });
    }

    /** @deprecated */
    private removeExpressionInputSub(): void {
        if (this.expressionInputSub) {
            this.expressionInputSub.unsubscribe();
            this.expressionInputSub = undefined;
        }
    }

    /** @deprecated */
    private clearExpression(): void {
        const newExpression: ExpressionModel = new ExpressionModel("");
        this.setSelectedProperty(newExpression.serialize());
        this.updateExpressionInputValue(newExpression.serialize());
    }

    /** @deprecated */
    private createExpressionInputForm(expression: string | Expression) {
        const expressionModel = new ExpressionModel(expression);
        this.setSelectedProperty(expression);

        this.expressionInputForm = this.formBuilder.group({
            'expressionInput': [
                {value: expressionModel.getExpressionScript(), disabled: !this.hasInputBinding},
                Validators.compose([Validators.required, Validators.minLength(1)])
            ]
        });
    }

    private updateExpressionInputValue(expression: string | Expression) {
        const expressionModel = new ExpressionModel(expression);
        this.setSelectedProperty(expressionModel.serialize());

        if (this.expressionInputForm && this.expressionInputForm.controls['expressionInput']) {
            this.expressionInputForm.controls['expressionInput'].setValue(
                expressionModel.getExpressionScript(),
                {
                    onlySelf: true,
                    emitEvent: false,
                });
        }
    }

    private listenToInputChanges(): void {
        const inputValueChange = this.expressionInputForm.controls['expressionInput'].valueChanges.subscribe((value: string) => {
            this.setSelectedProperty(value);
        });

        this.subs.push(inputValueChange);
    }

    private setSelectedProperty(value: string | Expression) {
        // if (this.hasInputBinding) {
            // this.selectedProperty.setValueFrom(value);
        // }
    }

    private toggleInputBinding() {
        if (!this.selectedProperty.isBound) {
            this.selectedProperty.createInputBinding();
            this.expressionInputForm.controls['expressionInput'].setValue(new ExpressionModel(""));
        } else {
            this.selectedProperty.removeInputBinding();
        }
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
