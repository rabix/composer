import {Component, forwardRef, Input} from "@angular/core";
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
                    data-test="type-select"
                    [formControl]="form.controls['type']">
                <option *ngFor="let type of types" 
                        [disabled]="readonly"
                        [value]="type">
                    {{type}}
                </option>
            </select>
        </div><!--Type-->

        <div class="form-group" *ngIf="paramType.type !== 'array'">
            <label>Allow array as well as single item</label>
            <span class="pull-right">
                    <ct-toggle-slider data-test="allow-array-toggle" [formControl]="form.controls['isItemOrArray']"></ct-toggle-slider>
                </span>
        </div>

        <div class="form-group">
            <div [class.hidden]="paramType?.type !== 'array'">
                <label class="form-control-label">Items Type</label>
                <select class="form-control"
                        data-test="items-type-select"
                        [formControl]="form.controls['items']">
                    <option *ngFor="let item of itemTypes"
                            [disabled]="readonly"
                            [value]="item">
                        {{item}}
                    </option>
                </select>
            </div> <!--Item type-->
        </div>
    `
})
export class InputTypeSelectComponent extends DirectiveBase implements ControlValueAccessor {

    paramType: ParameterTypeModel;

    types = ["array", "enum", "record", "File", "string", "int", "float", "boolean", "map"];

    itemTypes = ["enum", "record", "File", "string", "int", "float", "boolean", "map"];

    form: FormGroup = new FormGroup({
        type: new FormControl(null),
        items: new FormControl(null),
        isItemOrArray: new FormControl(null)
    });

    readonly = false;

    private onTouched = noop;

    private onChange = noop;

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
                    this.form.controls["isItemOrArray"].setValue(false, {onlySelf: true, emitEvent: false});
                }
            }

            if (this.paramType.type === "array" && !this.paramType.items) {
                this.paramType.items = "File";
                this.form.controls["items"].setValue("File", {onlySelf: true, emitEvent: false});
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

    setDisabledState(isDisabled: boolean): void {
        this.readonly = isDisabled;
        isDisabled ? this.form.controls["isItemOrArray"].disable({onlySelf: true, emitEvent: false})
            : this.form.controls["isItemOrArray"].enable({onlySelf: true, emitEvent: false});
    }
}
