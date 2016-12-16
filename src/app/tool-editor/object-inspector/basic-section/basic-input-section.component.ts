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
import {ComponentBase} from "../../../components/common/component-base";
import {CustomValidators} from "../../../validators/custom.validator";

require("./basic-input-section.component.scss");

@Component({
    selector: "basic-input-section",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BasicInputSectionComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => BasicInputSectionComponent), multi: true }
    ],
    template: `

          <form class="basic-input-section">
                <div class="form-group flex-container">
                    <label>Required</label>
                    <span class="align-right">
                        <toggle-slider [formControl]="basicSectionForm.controls['isRequired']"
                                       [off]="'No'" 
                                       [on]="'Yes'">
                        </toggle-slider>
                    </span>
                </div> <!-- Required -->
            
                <div class="form-group">
                    <label class="form-control-label">ID</label>
                    <input type="text" 
                           class="form-control"
                           [formControl]="basicSectionForm.controls['propertyIdForm']">
                </div> <!-- ID -->
                
                <input-type-select [formControl]="basicSectionForm.controls['typeForm']"></input-type-select>
                
                <div class="form-group flex-container" 
                        *ngIf="input.type.type !== 'map' && basicSectionForm.controls['isBound']">
                    <label>Include in command line</label>
                    <span class="align-right">
                        <toggle-slider [formControl]="basicSectionForm.controls['isBound']" 
                                       [off]="'No'" 
                                       [on]="'Yes'">
                        </toggle-slider>
                    </span>
                </div> <!-- Include in commandline -->
                
                <symbols-section class="form-group" 
                                *ngIf="input.type.type === 'enum'"
                                [formControl]="basicSectionForm.controls['symbols']">
                </symbols-section>
                
                <input-binding-section *ngIf="input.isBound" 
                            [context]="context"
                            [propertyType]="input.type.type"
                            [formControl]="basicSectionForm.controls['inputBinding']"></input-binding-section>
              
            </form> <!--basic-input-section-->
`
})
export class BasicInputSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job?: any, $self?: any} = {};

    /** The currently displayed property */
    private input: InputProperty;

    private basicSectionForm: FormGroup;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private initSymbolsList: string[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: InputProperty): void {
        this.input = input;

        this.basicSectionForm = this.formBuilder.group({
            propertyIdForm: [this.input.id],
            typeForm: [this.input.type, [Validators.required, CustomValidators.cwlModel]],
            isBound: [this.input.isBound],
            //FIXME: isNullable is undefined when it's not nullable
            isRequired: [!this.input.type.isNullable],
            inputBinding: [this.input.inputBinding, CustomValidators.cwlModel],
            itemType: [this.input.type.items ? this.input.type.items: 'File'],
            symbols: [this.input.type.symbols ? this.input.type.symbols: this.initSymbolsList]
        });

        this.listenToIsBoundChanges();
        this.listenToInputBindingChanges();
        this.listenToTypeFormChanges();
        this.listenToIdChanges();

        this.tracked = this.basicSectionForm.valueChanges.subscribe(value => {
            this.input.type.isNullable = !value.isRequired;

            if (value.symbols.length > 0 && this.input.type.type === 'enum') {
                this.input.type.symbols = value.symbols;
            }

            this.input.validate();
            this.propagateChange(this.input);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    validate(c: FormControl) {
        return this.basicSectionForm.valid ? null: { error: "Basic input section is not valid." }
    }

    private listenToIsBoundChanges(): void {
        this.tracked = this.basicSectionForm.controls['isBound'].valueChanges.subscribe((isBound: boolean) => {
            if (isBound) {
                this.input.createInputBinding();
                this.basicSectionForm.setControl('inputBinding', new FormControl(this.input.inputBinding));
                this.listenToInputBindingChanges();
            } else {
                this.input.removeInputBinding();
                this.basicSectionForm.removeControl('inputBinding');
            }
        });
    }

    private listenToIdChanges(): void {
        this.tracked = this.basicSectionForm.controls['propertyIdForm'].valueChanges
            .subscribe((id: string)  => {
                this.input.id = id;

                if (this.input.type.type === "enum" || this.input.type.type === "record") {
                    this.input.type.name = id;
                }
            });
    }

    private listenToInputBindingChanges(): void {
        this.tracked = this.basicSectionForm.controls['inputBinding'].valueChanges
            .subscribe((inputBinding: CommandLineBindingModel)  => {
                this.input.updateInputBinding(inputBinding);
            });
    }

    private listenToTypeFormChanges(): void {
        this.tracked = this.basicSectionForm.controls['typeForm'].valueChanges
            .subscribe((value: InputParameterTypeModel) => {

            this.input.type.setType(value.type);

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

            if (this.input.type.type === 'enum' || this.input.type.type === 'record') {
                this.input.type.name = this.input.id;
            }
        });
    }
}
