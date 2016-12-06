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
import {ExpressionModel, CommandLineBindingModel} from "cwlts/models/d2sb";

@Component({
    selector: 'input-binding-section',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputBindingSectionComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => InputBindingSectionComponent), multi: true }
    ],
    template: `
    <div class="form-group" *ngIf="inputBindingFormGroup && propertyType">
    
            <div class="form-group" *ngIf="propertyType !== 'record'">
                <label>Value</label>
                <ct-expression-input
                            [context]="context"
                            [formControl]="inputBindingFormGroup.controls['valueFrom']">
                </ct-expression-input>
            </div>
        
            <div class="form-group">
                <label>Position</label>
                <input class="form-control"
                       type="text"
                       [formControl]="inputBindingFormGroup.controls['position']"/>
             </div>
        
            <div class="form-group">
                <label>Prefix</label>
                <input class="form-control"
                       [formControl]="inputBindingFormGroup.controls['prefix']"/>
            </div>
                   
           <div class="form-group">
               <label>Separator</label>
               <select class="form-control" 
                       [formControl]="inputBindingFormGroup.controls['separate']">
                       
                    <option *ngFor="let separatorOption of separatorOptions" 
                            [value]="separatorOption.value">
                        {{separatorOption.text}}
                    </option>
               </select>
           </div>
           
           <div class="form-group" *ngIf="propertyType === 'array'">
                <label>Item Separator</label>
                <select class="form-control" 
                        [formControl]="inputBindingFormGroup.controls['itemSeparator']">
                    <option *ngFor="let itemSeparator of itemSeparators" 
                            [value]="itemSeparator.value">
                        {{itemSeparator.text}}
                    </option>
                </select>
           </div>
    </div>
    `
})
export class InputBindingSectionComponent extends ComponentBase implements ControlValueAccessor {

    /** The type of the property as an input, so we can react to changes in the component */
    @Input()
    public propertyType: string;

    @Input()
    public context: {$job: any, $self: any} = {};

    private inputBinding: CommandLineBindingModel;

    private inputBindingFormGroup: FormGroup;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private separatorOptions: {text: string, value: boolean}[] = [
        { text: "space", value: true },
        { text: "empty string", value: false }
    ];

    private itemSeparators: {text: string, value: string}[] = [
        { text: "equal", value: "=" },
        { text: "comma", value: "," },
        { text: "semicolon", value: ";" },
        { text: "space", value: " " },
        { text: "repeat", value: null }
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private writeValue(inputBinding: CommandLineBindingModel): void {
        this.inputBinding = inputBinding;

        if (!!this.inputBinding) {
            this.createInputBindingForm(this.inputBinding);
            this.inputBindingFormGroup.updateValueAndValidity();
        }
    }

    private ngOnChanges(): void {
        if (!!this.inputBindingFormGroup) {
            this.inputBindingFormGroup.updateValueAndValidity();
        }
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private validate(c: FormControl) {
        if (!!this.inputBindingFormGroup) {
            return !!this.inputBindingFormGroup.valid ? null: { error: "Input binding section is not valid." }
        }
    }

    private createInputBindingForm(inputBinding: CommandLineBindingModel): void {
        const valueFrom = !!inputBinding.valueFrom? inputBinding.valueFrom: new ExpressionModel(inputBinding.loc, "");

        this.inputBindingFormGroup = this.formBuilder.group({
            valueFrom: [valueFrom, [Validators.required, CustomValidators.cwlModel]],
            position:        [inputBinding.position, [Validators.pattern(/^\d+$/)]],
            prefix:          [inputBinding.prefix],
            separate:        [!!inputBinding.separate? inputBinding.separate: true],
            itemSeparator:   [!!inputBinding.itemSeparator? inputBinding.itemSeparator : null]
        });

        this.listenToInputBindingFormChanges();
    }

    private listenToInputBindingFormChanges(): void {
        this.tracked = this.inputBindingFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {
                this.setInputBindingProperty(this.inputBindingFormGroup, 'position', !!Number(value.position) ? Number(value.position): undefined);
                this.setInputBindingProperty(this.inputBindingFormGroup, 'prefix', !!value.prefix ? value.prefix: undefined);
                this.setInputBindingProperty(this.inputBindingFormGroup, 'separate', !!JSON.parse(value.separate) ? JSON.parse(value.separate): undefined);
                this.setInputBindingProperty(this.inputBindingFormGroup, 'itemSeparator', !!value.itemSeparator ? value.itemSeparator: undefined);

                const trimmedValueFrom: string = value.valueFrom.toString();

                if (!!trimmedValueFrom) {
                    this.inputBinding.setValueFrom(value.valueFrom.serialize());
                } else {
                    this.inputBinding.valueFrom = undefined;
                }

                this.propagateChange(this.inputBinding);
            });
    }

    private setInputBindingProperty(form: FormGroup, propertyName: string, newValue: any): void {
        if (form.controls[propertyName].valid) {
            this.inputBinding[propertyName] = newValue;
        } else {
            delete this.inputBinding[propertyName];
        }
    }
}
