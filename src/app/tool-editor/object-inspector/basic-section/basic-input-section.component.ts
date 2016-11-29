import {Component, Input, forwardRef} from "@angular/core";
import {
    Validators,
    FormControl,
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    FormGroup,
    FormBuilder,
    NG_VALIDATORS
} from "@angular/forms";
import {
    CommandInputParameterModel as InputProperty,
    CommandLineBindingModel,
    ExpressionModel,
    InputParameterTypeModel
} from "cwlts/models/d2sb";
import {ToggleComponent} from "../../../editor-common/components/toggle-slider/toggle-slider.component";
import {InputTypeSelectComponent} from "../../common/type-select/type-select.component";
import {ComponentBase} from "../../../components/common/component-base";
import {CustomValidators} from "../../../validators/custom.validator";
import {FormPanelComponent} from "../../../core/elements/form-panel.component";
import {InputBindingSectionComponent} from "../input-binding/input-binding-section.component";

require("./basic-input-section.component.scss");

@Component({
    selector: "basic-input-section",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BasicInputSectionComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => BasicInputSectionComponent), multi: true }
    ],
    directives: [
        ToggleComponent,
        InputTypeSelectComponent,
        FormPanelComponent,
        InputBindingSectionComponent
    ],
    template: `
<ct-form-panel>
    <div class="tc-header">Basic</div>
    <div class="tc-body" *ngIf="selectedProperty">

          <form class="basic-input-section">
                <div class="form-group flex-container">
                    <label>Required</label>
                    <span class="align-right">
                        {{!selectedProperty.type.isNullable ? "Yes" : "No"}}
                        <toggle-slider [formControl]="basicSectionForm.controls['isRequired']"></toggle-slider>
                    </span>
                </div> <!-- Required -->
            
                <div class="form-group">
                    <label>ID</label>
                    <input type="text" 
                           class="form-control"
                           [formControl]="basicSectionForm.controls['propertyIdForm']">
                </div> <!-- ID -->
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    <input-type-select [formControl]="basicSectionForm.controls['typeForm']"></input-type-select>
                </div> <!-- Type -->
                
                <div *ngIf="selectedProperty.type.type === 'array'">
                    <label>Item Types</label>
                    <select class="form-control" 
                            [formControl]="basicSectionForm.controls['itemType']">
                           
                        <option *ngFor="let item of itemTypes" 
                                [value]="item">
                            {{item}}
                        </option>
                    </select>
                </div> <!--Item type-->
                
                <div class="form-group flex-container" 
                        *ngIf="selectedProperty.type.type !== 'map' && basicSectionForm.controls['isBound']">
                    <label>Include in command line</label>
                    <span class="align-right">
                        {{selectedProperty.isBound ? "Yes" : "No"}}
                        <toggle-slider [formControl]="basicSectionForm.controls['isBound']"></toggle-slider>
                    </span>
                </div> <!-- Include in commandline -->
                
                <input-binding-section *ngIf="selectedProperty.isBound" 
                            [propertyType]="selectedProperty.type.type"
                            [formControl]="basicSectionForm.controls['inputBinding']"></input-binding-section>
              
            </form> <!--basic-input-section-->
        </div> <!--tc-body-->
</ct-form-panel>
`
})
export class BasicInputSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any, $self: any} = {};

    /** The currently displayed property */
    private selectedProperty: InputProperty;

    private basicSectionForm: FormGroup;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private itemTypes: string[] = ["string", "int", "float", "File", "record", "map", "enum", "boolean"];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private writeValue(property: InputProperty): void {
        this.selectedProperty = property;

        this.basicSectionForm = this.formBuilder.group({
            typeForm: [this.selectedProperty.type, [Validators.required, CustomValidators.cwlModel]],
            propertyIdForm: [this.selectedProperty.id],
            isBound: [!!this.selectedProperty.isBound],
            isRequired: [!this.selectedProperty.type.isNullable],
            inputBinding: [{
                inputBinding: this.selectedProperty.inputBinding,
                valueFrom: this.selectedProperty.getValueFrom()
            }],
            itemType: [!!this.selectedProperty.type.items ? this.selectedProperty.type.items : 'string']
        });

        this.tracked = this.basicSectionForm.controls['isBound'].valueChanges.subscribe((isBound: boolean) => {
            if (!!isBound) {
                this.selectedProperty.createInputBinding();
                this.basicSectionForm.setControl('inputBinding', new FormControl({
                    inputBinding: this.selectedProperty.inputBinding,
                    valueFrom: this.selectedProperty.getValueFrom()
                }));
            } else {
                this.selectedProperty.removeInputBinding();
                this.basicSectionForm.removeControl('inputBinding');
            }
        });

        this.listenToInputBindingChanges();

        this.listenToTypeFormChanges();

        this.tracked = this.basicSectionForm.valueChanges.subscribe(value => {
            this.selectedProperty.type.isNullable = !value.isRequired;
            this.propagateChange(this.selectedProperty);
        });
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private validate(c: FormControl) {
        return !!this.basicSectionForm.valid ? null: { error: "Basic input section is not valid." }
    }

    private listenToInputBindingChanges(): void {
        this.tracked = this.basicSectionForm.controls['inputBinding'].valueChanges
            .subscribe((value: {inputBinding: CommandLineBindingModel, valueFrom: ExpressionModel})  => {
                if (!!value.valueFrom) {
                    this.selectedProperty.setValueFrom(value.valueFrom.serialize());
                }

                this.selectedProperty.inputBinding = value.inputBinding;
            });
    }

    private listenToTypeFormChanges(): void {
        this.tracked = this.basicSectionForm.controls['typeForm'].valueChanges.subscribe((value: InputParameterTypeModel) => {

            if (value.type !== 'array' && this.selectedProperty.isBound) {
                this.selectedProperty.inputBinding.itemSeparator = undefined;
            }

            if (this.selectedProperty.type.type === 'map' && this.selectedProperty.isBound) {
                this.selectedProperty.removeInputBinding();
                this.basicSectionForm.controls['isBound'].setValue(this.selectedProperty.isBound);
            }

            if (!!value.items && this.selectedProperty.type.type === 'array') {
                this.selectedProperty.type.items = value.items;
            }
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
