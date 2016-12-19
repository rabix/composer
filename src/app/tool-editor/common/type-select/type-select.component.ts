import {InputParameterTypeModel} from "cwlts/models/d2sb/InputParameterTypeModel";
import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";

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
                <label>Items Type</label>
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

    private paramType: InputParameterTypeModel;

    private propertyTypes = ["array", "enum", "record", "File", "string", "int", "float", "boolean", "map"];

    private itemTypes =  ["enum", "record", "File", "string", "int", "float", "boolean", "map"];

    private form: FormGroup = new FormGroup({
        type: new FormControl(null),
        items: new FormControl(null)
    });

    private onTouched = noop;

    private onChange = noop;

    writeValue(paramType: InputParameterTypeModel): void {
        this.paramType = paramType;

        if (!this.paramType.type) {
            this.paramType.type = "File";
            this.onChange(this.paramType);
        }

        this.form.controls["type"].setValue(this.paramType.type);
        this.form.controls["items"].setValue(this.paramType.items);

        this.tracked = this.form.valueChanges.subscribe(change => {
            this.paramType.type = change.type;

            if (this.paramType.type === "array") {

                if (!this.paramType.items) {
                    this.paramType.items = "File";
                    this.form.controls["items"].setValue("File");
                } else {
                    this.paramType.items = change.items;
                }
            }

            this.onChange(this.paramType);
        });
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
