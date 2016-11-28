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
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {ToggleComponent} from "../../../editor-common/components/toggle-slider/toggle-slider.component";
import {InputTypeSelectComponent} from "../../common/type-select/type-select.component";
import {ComponentBase} from "../../../components/common/component-base";
import {CustomValidators} from "../../../validators/custom.validator";
import {FormPanelComponent} from "../../../core/elements/form-panel.component";
import {InputBindingSectionComponent} from "../input-binding/input-binding-section.component";
import {Subscription} from "rxjs";

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
                </div>
            
                <div class="form-group">
                    <label>ID</label>
                    <input type="text" 
                           class="form-control"
                           [formControl]="basicSectionForm.controls['propertyIdForm']">
                </div>
                
                <div class="form-group">
                    <label for="inputType">Type</label>
                    <input-type-select [formControl]="basicSectionForm.controls['typeForm']"></input-type-select>
                </div>
                
                
                <div class="form-group flex-container" *ngIf="selectedProperty.type.type !== 'map'">
                    <label>Include in command line</label>
                    <span class="align-right">
                        {{selectedProperty.isBound ? "Yes" : "No"}}
                        <toggle-slider [formControl]="basicSectionForm.controls['isBound']"></toggle-slider>
                    </span>
                </div>
                
                <input-binding-section *ngIf="inputBindingForm" 
                            [formControl]="inputBindingForm"></input-binding-section>
              
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

    private inputBindingForm: FormControl;

    private basicSectionForm: FormGroup;

    private inputBindingChanges: Subscription;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private writeValue(property: InputProperty): void {
        this.selectedProperty = property;

        this.basicSectionForm = this.formBuilder.group({
            typeForm: [this.selectedProperty.type, [Validators.required, CustomValidators.cwlModel]],
            propertyIdForm: [this.selectedProperty.id],
            isBound: [!!this.selectedProperty.isBound],
            isRequired: [!this.selectedProperty.type.isNullable]
        });

        if (!!this.selectedProperty.isBound) {
            this.inputBindingForm = new FormControl(this.selectedProperty);
            this.listenToInputBindingChanges();
        }

        this.tracked = this.basicSectionForm.controls['isBound'].valueChanges.subscribe(isBound => {
            if (!!isBound) {
                this.selectedProperty.createInputBinding();
                this.inputBindingForm = new FormControl(this.selectedProperty);
                this.listenToInputBindingChanges();
            } else {
                this.selectedProperty.removeInputBinding();
                this.inputBindingForm = undefined;
            }
        });

        this.tracked = this.basicSectionForm.valueChanges.subscribe(value => {
            this.selectedProperty.type.isNullable = !value.isRequired;

            if (this.selectedProperty.type.type !== 'array' && this.selectedProperty.isBound) {
                this.selectedProperty.inputBinding.itemSeparator = undefined;
            }

            if (this.selectedProperty.type.type === 'map' && this.selectedProperty.isBound) {
                this.selectedProperty.removeInputBinding();
            }

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
        let isValid = false;

        if (!!this.inputBindingForm) {
            isValid = this.inputBindingForm.valid && this.basicSectionForm;
        } else {
            isValid = this.basicSectionForm.valid;
        }

        return !!isValid ? null: { error: "Basic input section is not valid." }
    }

    private listenToInputBindingChanges(): void {
        this.inputBindingChanges = this.inputBindingForm.valueChanges.subscribe(_ => {
            this.propagateChange(this.selectedProperty);
        });
    }

    ngOnDestroy(): void {
        this.inputBindingChanges.unsubscribe();
        super.ngOnDestroy();
    }
}
