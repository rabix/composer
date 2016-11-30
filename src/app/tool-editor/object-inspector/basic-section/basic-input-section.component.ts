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
    <div class="tc-body" *ngIf="input">

          <form class="basic-input-section">
                <div class="form-group flex-container">
                    <label>Required</label>
                    <span class="align-right">
                        {{!input.type.isNullable ? "Yes" : "No"}}
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
                </div> <!-- Input Type -->
                
                <div class="form-group" *ngIf="input.type.type === 'array'">
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
                        *ngIf="input.type.type !== 'map' && basicSectionForm.controls['isBound']">
                    <label>Include in command line</label>
                    <span class="align-right">
                        {{input.isBound ? "Yes" : "No"}}
                        <toggle-slider [formControl]="basicSectionForm.controls['isBound']"></toggle-slider>
                    </span>
                </div> <!-- Include in commandline -->
                
                <symbols-section class="form-group" 
                                *ngIf="input.type.type === 'enum'"
                                [formControl]="basicSectionForm.controls['symbols']">
                </symbols-section>
                
                <input-binding-section *ngIf="input.isBound" 
                            [propertyType]="input.type.type"
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
    private input: InputProperty;

    private basicSectionForm: FormGroup;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private itemTypes: string[] = ["string", "int", "float", "File", "record", "map", "enum", "boolean"];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private writeValue(input: InputProperty): void {
        this.input = input;

        this.basicSectionForm = this.formBuilder.group({
            typeForm: [this.input.type, [Validators.required, CustomValidators.cwlModel]],
            propertyIdForm: [this.input.id],
            isBound: [!!this.input.isBound],
            isRequired: [!this.input.type.isNullable],
            inputBinding: [this.input.inputBinding],
            itemType: [!!this.input.type.items ? this.input.type.items: 'string'],
            symbols: [!!this.input.type.symbols ? this.input.type.symbols: []]
        });

        this.listenToIsBoundChanges();
        this.listenToInputBindingChanges();
        this.listenToTypeFormChanges();

        this.tracked = this.basicSectionForm.valueChanges.subscribe(value => {
            this.input.type.isNullable = !value.isRequired;
            this.input.type.symbols = value.symbols.length > 0 ? value.symbols: undefined;
            this.propagateChange(this.input);
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

    private listenToIsBoundChanges(): void {
        this.tracked = this.basicSectionForm.controls['isBound'].valueChanges.subscribe((isBound: boolean) => {
            if (!!isBound) {
                this.input.createInputBinding();
                this.basicSectionForm.setControl('inputBinding', new FormControl(this.input.inputBinding));
            } else {
                this.input.removeInputBinding();
                this.basicSectionForm.removeControl('inputBinding');
            }
        });
    }

    private listenToInputBindingChanges(): void {
        this.tracked = this.basicSectionForm.controls['inputBinding'].valueChanges
            .subscribe((inputBinding: CommandLineBindingModel)  => {
                this.input.inputBinding = inputBinding;
            });
    }

    private listenToTypeFormChanges(): void {
        this.tracked = this.basicSectionForm.controls['typeForm'].valueChanges.subscribe((value: InputParameterTypeModel) => {

            if (value.type !== 'array' && this.input.isBound) {
                this.input.inputBinding.itemSeparator = undefined;
            }

            if (this.input.type.type === 'map' && this.input.isBound) {
                this.input.removeInputBinding();
                this.basicSectionForm.controls['isBound'].setValue(this.input.isBound);
            }

            if (!!value.items && this.input.type.type === 'array') {
                this.input.type.items = value.items;
            }
        });
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
