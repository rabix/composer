import {Component, forwardRef, Input, OnChanges} from "@angular/core";
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ParameterTypeModel} from "cwlts/models";
import {noop} from "../../../lib/utils.lib";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-type-select",
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputTypeSelectComponent), multi: true}
    ],
    template: `
        <div class="form-group">
            <label class="form-control-label">Type</label>
            <select class="form-control"
                    [formControl]="form.controls['type']">
                <option *ngFor="let type of types" [value]="type">
                    {{type}}
                </option>
            </select>
        </div><!--Type-->

        <div class="form-group" *ngIf="paramType.type !== 'array'">
            <label>Allow array as well as single item</label>
            <span class="pull-right">
                    <ct-toggle-slider [formControl]="form.controls['isItemOrArray']"></ct-toggle-slider>
                </span>
        </div>

        <div class="form-group">
            <div [class.hidden]="paramType?.type !== 'array'">
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
export class InputTypeSelectComponent extends DirectiveBase implements ControlValueAccessor {

    public paramType: ParameterTypeModel;

    public types = ["array", "enum", "record", "File", "string", "int", "float", "boolean", "map"];

    public itemTypes = ["enum", "record", "File", "string", "int", "float", "boolean", "map"];

    public form: FormGroup = new FormGroup({
        type: new FormControl(null),
        items: new FormControl(null),
        isItemOrArray: new FormControl(null)
    });

    private onTouched = noop;

    private onChange = noop;

    private skipOnChange = false;

    writeValue(paramType: ParameterTypeModel): void {
        this.paramType = paramType;

        if (paramType.hasDirectoryType) {
            if (this.types.indexOf("Directory") === -1) {
                this.types.push("Directory");
            }
            if (this.itemTypes.indexOf("Directory") === -1) {
                this.itemTypes.push("Directory");
            }
        }

        this.form.controls["type"].setValue(this.paramType.type, {onlySelf: true});
        this.form.controls["items"].setValue(this.paramType.items, {onlySelf: true});
        this.form.controls["isItemOrArray"].setValue(this.paramType.isItemOrArray, {onlySelf: true});

        this.tracked = this.form.valueChanges.subscribe(change => {
            if (change.type !== undefined) {
                this.paramType.type = change.type;
            }
            this.paramType.isItemOrArray = change.isItemOrArray;

            if (change.type === "array") {
                this.paramType.items = change.items;
                if (this.paramType.isItemOrArray) {
                    this.paramType.isItemOrArray = false;
                    this.form.controls["isItemOrArray"].setValue(false, {onlySelf: true});
                }
            }

            if (this.paramType.type === "array" && !this.paramType.items) {
                this.paramType.items = "File";
                this.form.controls["items"].setValue("File", {onlySelf: true});
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
            this.form.controls["isItemOrArray"].disable();
            this.form.controls["items"].disable();
        }
    }
}
