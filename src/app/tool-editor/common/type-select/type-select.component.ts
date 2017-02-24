import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";
import {InputParameterTypeModel} from "cwlts/models";

@Component({
    selector: 'input-type-select',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputTypeSelectComponent), multi: true }
    ],
    template: `
        <div class="form-group">
            <label class="form-control-label">Type</label>
            <select class="form-control"
                    [formControl]="form.controls['type']">
                <option *ngFor="let propertyType of propertyTypes" [value]="propertyType">
                    {{propertyType}}
                </option>
            </select>
        </div><!--Type-->
        
        
        <div class="form-group">
            <div [hidden]="paramType?.type !== 'array'">
                <label class="form-control-label">Items Type</label>
                <select class="form-control"
                        [formControl]="form.controls['items']">
                    <option *ngFor="let item of itemTypes"
                            [value]="item">
                        {{item}}
                    </option>
                </select>
            </div> <!--Item type-->
        </div>
    `
})
export class InputTypeSelectComponent extends ComponentBase implements ControlValueAccessor {

    public paramType: InputParameterTypeModel;

    public propertyTypes = ["array", "enum", "record", "File", "string", "int", "float", "boolean", "map"];

    public itemTypes =  ["enum", "record", "File", "string", "int", "float", "boolean", "map"];

    public form: FormGroup = new FormGroup({
        type: new FormControl(null),
        items: new FormControl(null)
    });

    private onTouched = noop;

    private onChange = noop;

    private skipOnChange = false;

    writeValue(paramType: InputParameterTypeModel): void {
        this.paramType = paramType;

        this.form.controls["type"].setValue(this.paramType.type);
        this.form.controls["items"].setValue(this.paramType.items);

        this.tracked = this.form.valueChanges.subscribe(change => {
            this.paramType.type = change.type;
            if (change.type === "array") {
                this.paramType.items = change.items;
            }

            if (this.paramType.type === "array" && !this.paramType.items) {
                this.paramType.items = "File";
                this.form.controls["items"].setValue("File");
            }

            // This method gets triggered if we set disabled state
            // and there is no way to distinguish it from other events.
            if (!this.skipOnChange) {
                this.skipOnChange = false;
                this.onChange(this.paramType);
            }
        });
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean) {
        if (isDisabled) {
            this.skipOnChange = true;
            this.form.controls["type"].disable();
            this.form.controls["items"].disable();
        }
    }
}
