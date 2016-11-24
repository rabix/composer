import {InputParameterTypeModel} from "cwlts/models/d2sb/InputParameterTypeModel";
import {Component, forwardRef} from "@angular/core";
import {ComponentBase} from "../../common/component-base";
import {ControlValueAccessor, FormControl, Validators, NG_VALUE_ACCESSOR} from "@angular/forms";
import {PrimitiveParameterType} from "cwlts/models/d2sb/ParameterTypeModel";

@Component({
    selector: 'input-type-select',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputTypeSelectComponent), multi: true }
    ],
    template: `
        <select class="form-control" 
                [formControl]="typeSelectControl">
            <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                {{propertyType}}
            </option>
        </select>
    `
})
export class InputTypeSelectComponent extends ComponentBase implements ControlValueAccessor {

    private inputParameter: InputParameterTypeModel;

    private propertyTypes = ["array", "enum", "record", "File", "string", "int", "float", "boolean", "map"];

    private typeSelectControl: FormControl;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    constructor() {
        super();
    }

    private writeValue(inputParameter: InputParameterTypeModel): void {
        this.inputParameter = inputParameter;
        this.typeSelectControl = new FormControl(this.inputParameter.type, [Validators.required]);

        this.tracked = this.typeSelectControl.valueChanges.subscribe((value: PrimitiveParameterType) => {
            this.inputParameter.type = value;
            this.propagateChange(this.inputParameter);
        });
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    ngOnDestroy(): void {
        super.ngOnDestroy();
    }
}
