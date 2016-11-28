import {Component, forwardRef} from "@angular/core";
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
import {ExpressionModel, CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

@Component({
    selector: 'input-binding-section',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputBindingSectionComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => InputBindingSectionComponent), multi: true }
    ],
    template: `
    <div class="form-group" *ngIf="inputBindingFormGroup">
    
            <div *ngIf="selectedProperty.type.type !== 'record'">
                <label>Value</label>
                <expression-input
                            [context]="context"
                            [formControl]="inputBindingFormGroup.controls['expressionInput']">
                </expression-input>
            </div>
        
            <label>Position</label>
            <input class="form-control"
                   type="text"
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
           
           <div *ngIf="selectedProperty.type.type === 'array'">
                <label>Item Separator</label>
                <select class="form-control" 
                        [formControl]="inputBindingFormGroup.controls['itemSeparator']">
                    <option *ngFor="let itemSeparator of itemSeparators" 
                            [value]="itemSeparator.value"
                            [selected]="itemSeparator.value == selectedProperty.inputBinding.itemSeparator">
                        {{itemSeparator.text}}
                    </option>
                </select>
           </div>
    </div>
    `
})
export class InputBindingSectionComponent extends ComponentBase implements ControlValueAccessor {

    private selectedProperty: InputProperty;

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

    private writeValue(property: InputProperty): void {
        this.selectedProperty = property;
        this.createInputBindingForm(this.selectedProperty);
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private validate(c: FormControl) {
        return !!this.inputBindingFormGroup.valid ? null: { error: "Input binding section is not valid." }
    }

    private createInputBindingForm(property: InputProperty): void {
        let valueFrom;

        if (!!property.getValueFrom()) {
            valueFrom = property.getValueFrom();
        } else {
            valueFrom = new ExpressionModel(property.inputBinding.loc, "");
        }

        this.inputBindingFormGroup = this.formBuilder.group({
            expressionInput: [valueFrom, [CustomValidators.cwlModel]],
            position:        [property.inputBinding.position, [Validators.pattern(/^\d+$/)]],
            prefix:          [property.inputBinding.prefix],
            separate:        [property.inputBinding.separate],
            itemSeparator:   [property.inputBinding.itemSeparator]
        });

        this.listenToInputBindingFormChanges();
    }

    private listenToInputBindingFormChanges(): void {
        this.tracked = this.inputBindingFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {
                if (this.inputBindingFormGroup.controls['expressionInput'].valid) {
                    this.selectedProperty.inputBinding.setValueFrom(value.expressionInput.serialize());
                } else {
                    this.selectedProperty.inputBinding.valueFrom = undefined;
                }

                this.setInputBindingProperty(this.inputBindingFormGroup, 'position', Number(value.position));
                this.setInputBindingProperty(this.inputBindingFormGroup, 'prefix', value.prefix);
                this.setInputBindingProperty(this.inputBindingFormGroup, 'separate', JSON.parse(value.separate));
                this.setInputBindingProperty(this.inputBindingFormGroup, 'itemSeparator', value.itemSeparator);

                this.propagateChange(this.selectedProperty);
            });
    }

    private setInputBindingProperty(form: FormGroup, propertyName: string, newValue: any): void {
        if (form.controls[propertyName].valid) {
            this.selectedProperty.inputBinding[propertyName] = newValue;
        } else {
            this.selectedProperty.inputBinding[propertyName] = undefined;
        }
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
