import {Component, Input, forwardRef} from "@angular/core";
import {Validators, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder} from "@angular/forms";
import {ExpressionModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {SandboxService} from "../../../../services/sandbox/sandbox.service";
import {ToggleComponent} from "../../../common/toggle-slider/toggle-slider.component";
import {CustomValidators} from "../../../../validators/custom.validator";
import {ComponentBase} from "../../../common/component-base";

require("./basic-input-section.component.scss");

@Component({
    selector: "basic-input-section",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BasicInputSectionComponent), multi: true }
    ],
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
                
                <div class="form-group flex-container">
                    <label>Include in command line</label>
                    
                    <span class="align-right">
                        {{selectedProperty.isBound ? "Yes" : "No"}}
                        <toggle-slider [(checked)]="selectedProperty.isBound"
                                        (checkedChange)="toggleInputBinding(selectedProperty.isBound)"></toggle-slider>
                    </span>
                </div>
                
               <div class="form-group" *ngIf="inputBindingFormGroup">
                    <label>Value</label>
                    <expression-input
                                [context]="context"
                                [formControl]="inputBindingFormGroup.controls['expressionInput']">
                    </expression-input>
                
                    <label>Position</label>
                    <input class="form-control"
                           [formControl]="inputBindingFormGroup.controls['position']"/>
                
                    <label>Prefix</label>
                    <input class="form-control"
                           [formControl]="inputBindingFormGroup.controls['prefix']"/>
                           
                    <label>Separator</label>
                    
                   <select class="form-control" 
                           [formControl]="inputBindingFormGroup.controls['separate']">
                        <option *ngFor="let separatorOption of separatorOptions" 
                                [value]="separatorOption.value"
                                [selected]="separatorOption.value === !!selectedProperty.inputBinding.separate">
                            {{separatorOption.text}}
                        </option>
                   </select>
                </div>
            </form>
    `
})
export class BasicInputSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any, $self: any};

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    /** Possible property types */
    private propertyTypes = ["File", "string", "enum", "int", "float", "boolean", "array", "record", "map"];

    public inputBindingFormGroup: FormGroup;

    private sandboxService: SandboxService;

    private separatorOptions: {text: string, value: boolean }[] = [
        { text: "space", value: true },
        { text: "empty string", value: false }
    ];

    private onTouched = () => { };

    private propagateChange = (_) => {};

    constructor(private formBuilder: FormBuilder) {
        super();
        this.sandboxService = new SandboxService();
    }

    private writeValue(property: InputProperty): void {
        this.selectedProperty = property;

        if (this.selectedProperty.isBound) {
            this.createExpressionInputForm(this.selectedProperty);
        } else {
            this.inputBindingFormGroup = undefined;
        }
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private createExpressionInputForm(property: InputProperty): void {
        const valueFrom = !!property.getValueFrom() ? property.getValueFrom(): new ExpressionModel(null, "");

        this.inputBindingFormGroup = this.formBuilder.group({
            expressionInput: new FormControl(
                valueFrom, [Validators.required, CustomValidators.cwlModel]
            ),
            position: new FormControl(
                property.inputBinding.position, [Validators.required]
            ),
            prefix: new FormControl(
                property.inputBinding.prefix, [Validators.required]
            ),
            separate: new FormControl(
                property.inputBinding.separate, [Validators.required]
            )
        });

        this.tracked = this.inputBindingFormGroup.valueChanges.subscribe(value => {
            property.inputBinding.setValueFrom(value.expressionInput.serialize());
            property.inputBinding.position = Number(value.position);
            property.inputBinding.prefix = value.prefix;
            property.inputBinding.separate = JSON.parse(value.separate);

            this.propagateChange(property);
        });
    }

    private toggleInputBinding(hasBinding: boolean): void {
        if (!hasBinding) {
            this.selectedProperty.createInputBinding();
            this.createExpressionInputForm(this.selectedProperty);
        } else {
            this.inputBindingFormGroup = undefined;
            this.selectedProperty.removeInputBinding();
            this.propagateChange(this.selectedProperty);
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
