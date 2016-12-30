import {Component, forwardRef, Input} from "@angular/core";
import {
    NG_VALUE_ACCESSOR,
    ControlValueAccessor,
    FormBuilder,
    Validators,
    FormGroup,
    NG_VALIDATORS
} from "@angular/forms";
import {ComponentBase} from "../../../../components/common/component-base";
import {CommandLineBindingModel} from "cwlts/models/d2sb";
import {noop} from "../../../../lib/utils.lib";

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
    </div>
    `
})
export class InputBindingSectionComponent extends ComponentBase implements ControlValueAccessor {

    /** The type of the property as an input, so we can react to changes in the component */
    @Input()
    public propertyType: string;

    @Input()
    public context: {$job?: any, $self?: any} = {};

    private inputBinding: CommandLineBindingModel;

    private inputBindingFormGroup: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    //@todo add itemSeparator field for type array
    private itemSeparators: {text: string, value: string}[] = [
        {text: "equal", value: "="},
        {text: "comma", value: ","},
        {text: "semicolon", value: ";"},
        {text: "space", value: " "},
        {text: "repeat", value: null}
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(inputBinding: CommandLineBindingModel): void {
        this.inputBinding = inputBinding;

        if (!!this.inputBinding) {
            this.createInputBindingForm(this.inputBinding);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    validate() {
        if (!!this.inputBindingFormGroup) {
            return this.inputBindingFormGroup.valid ? null : {error: "Input binding section is not valid."}
        }
    }

    private createInputBindingForm(inputBinding: CommandLineBindingModel): void {
        this.inputBindingFormGroup = this.formBuilder.group({
            valueFrom: [inputBinding.valueFrom, [Validators.required]],
            position: [inputBinding.position, [Validators.pattern(/^\d+$/)]],
            prefix: [inputBinding.prefix],
            separate: [inputBinding.separate !== false],
            itemSeparator: [!!inputBinding.itemSeparator ? inputBinding.itemSeparator : null]
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
                    valueFrom: this.propertyType !== "record" ? value.valueFrom.serialize() : undefined
                };

                this.inputBinding = new CommandLineBindingModel(binding);
                this.propagateChange(this.inputBinding);
            });
    }
}
