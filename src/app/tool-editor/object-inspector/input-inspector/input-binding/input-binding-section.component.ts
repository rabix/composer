import {Component, forwardRef, Input} from "@angular/core";
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    FormBuilder,
    Validators,
    FormGroup,
    NG_VALIDATORS,
    FormControl
} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CustomValidators} from "../../../validators/custom.validator";
import {CommandInputParameterModel as InputProperty, CommandLineBindingModel} from "cwlts/models/d2sb";

@Component({
    selector: 'input-binding-section',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputBindingSectionComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => InputBindingSectionComponent),
            multi: true
        }
    ],
    template: `
    <div class="form-group" *ngIf="inputBindingFormGroup && propertyType">
    
            <div class="form-group" *ngIf="propertyType !== 'record'">
                <label class="form-control-label">Value</label>
                <ct-expression-input
                            [context]="context"
                            [formControl]="inputBindingFormGroup.controls['valueFrom']">
                </ct-expression-input>
            </div>
        
            <div class="form-group">
                <label class="form-control-label">Position</label>
                <input class="form-control"
                       type="number"
                       [formControl]="inputBindingFormGroup.controls['position']"/>
             </div>
        
            <div class="form-group">
                <label class="form-control-label">Prefix</label>
                <input class="form-control"
                       [formControl]="inputBindingFormGroup.controls['prefix']"/>
            </div>
                 
            <div class="form-group flex-container">
                <label>Prefix and value separation</label>
                <span class="align-right">
                    <toggle-slider [formControl]="inputBindingFormGroup.controls['separate']"
                                   [on]="'Separate'"
                                   [off]="'Join'"></toggle-slider>
                </span>
            </div>
            
            <stage-input [formControl]="inputBindingFormGroup.controls['stageInputSection']">
            </stage-input>
           
            <secondary-files *ngIf="input.type.type === 'File'"
                             [formControl]="inputBindingFormGroup.controls['secondaryFilesSection']"
                             [context]="context"></secondary-files>
    </div>
    `
})
export class InputBindingSectionComponent extends ComponentBase implements ControlValueAccessor {

    /** The type of the property as an input, so we can react to changes in the component */
    @Input()
    public propertyType: string;

    @Input()
    public context: {$job?: any, $self?: any} = {};

    private input: InputProperty;

    private inputBindingFormGroup: FormGroup;

    private onTouched = () => {
    };

    private propagateChange = (_) => {
    };

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: InputProperty): void {
        this.input = input;

        if (!!this.input.inputBinding) {
            this.createInputBindingForm(this.input);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    validate(c: FormControl) {
        if (!!this.inputBindingFormGroup) {
            return this.inputBindingFormGroup.valid ? null : {error: "Input binding section is not valid."}
        }
    }

    private createInputBindingForm(input: InputProperty): void {
        this.inputBindingFormGroup = this.formBuilder.group({
            stageInputSection: [input],
            secondaryFilesSection: [input.inputBinding.secondaryFiles || []],
            valueFrom: [input.inputBinding.valueFrom, [Validators.required, CustomValidators.cwlModel]],
            position: [input.inputBinding.position, [Validators.pattern(/^\d+$/)]],
            prefix: [input.inputBinding.prefix],
            separate: [input.inputBinding.separate !== false],
            itemSeparator: [!!input.inputBinding.itemSeparator ? input.inputBinding.itemSeparator : null]
        });

        this.listenToInputBindingFormChanges();
    }

    private listenToInputBindingFormChanges(): void {
        this.tracked = this.inputBindingFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {
                const binding = {
                    position: value.position || undefined,
                    prefix: value.prefix || undefined,
                    separate: value.separate,
                    itemSeparator: value.itemSeparator || undefined,
                    valueFrom: value.valueFrom.serialize(),
                    loadContents: value.stageInputSection.inputBinding.loadContents,
                    secondaryFiles: value.secondaryFilesSection
                };


                this.input.inputBinding = new CommandLineBindingModel(binding);
                Object.assign(this.input.customProps, value.stageInputSection.customProps);

                this.propagateChange(this.input);
            });
    }
}
