import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CommandInputParameterModel, CommandOutputParameterModel} from "cwlts/models";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-description-section",
    styleUrls: ["./description.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DescriptionComponent), multi: true}
    ],
    template: `
        <ct-form-panel class="borderless" [collapsed]="true">
            <div class="tc-header">Description</div>
            <div class="tc-body" *ngIf="port && form">

                <div class="form-text">
                    This description will be visible when using the tool in the workflow editor.
                    It's best to be concise and informative.
                </div>

                <!--Label-->
                <div class="form-group">
                    <label class="form-control-label">Label</label>
                    <input type="text"
                           class="form-control"
                           data-test="label-field"
                           [formControl]="form.controls['label']">
                </div>

                <!--Description-->
                <div class="form-group">
                    <label class="form-control-label">Description</label>
                    <textarea class="form-control"
                              rows="4"
                              data-test="desc-field"
                              [formControl]="form.controls['description']"></textarea>
                </div>
                
                <!--Input only below-->
                <!--Alternative Prefix-->
                <div *ngIf="isInputPort()" class="form-group">
                    <label class="form-control-label">Alternative Prefix</label>
                    <input class="form-control"
                           type="text"
                           data-test="alt-prefix-field"
                           [formControl]="form.controls['altPrefix']">
                </div>

                <!--Category-->
                <div *ngIf="isInputPort()" class="form-group">
                    <label class="form-control-label">Category</label>
                    <input class="form-control"
                           type="text"
                           data-test="category-field"
                           [formControl]="form.controls['category']">
                </div>

                <!--Tool Default-->
                <div *ngIf="isInputPort() && !isFileType()" class="form-group">
                    <label class="form-control-label">Tool Defaults</label>
                    <input class="form-control"
                           type="text"
                           data-test="tool-defaults-field"
                           [formControl]="form.controls['toolDefaults']">
                </div>

                <!--File Types-->
                <div *ngIf="isFileType()" class="form-group">
                    <label class="form-control-label">File types</label>
                    <ct-auto-complete [formControl]="form.controls['fileTypes']"
                                      [create]="true"></ct-auto-complete>
                </div>
            </div>
        </ct-form-panel>
    `
})
export class DescriptionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    public port: CommandOutputParameterModel | CommandInputParameterModel;

    private onTouched = noop;

    private propagateChange = noop;

    public form: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(port: CommandOutputParameterModel | CommandInputParameterModel): void {
        this.port = port;

        this.form = this.formBuilder.group({
            label: [{value: this.port.label, disabled: this.readonly}],
            description: [{value: this.port.description, disabled: this.readonly}],
            altPrefix: [{value: this.port.customProps["sbg:altPrefix"], disabled: this.readonly}],
            category: [{value: this.port.customProps["sbg:category"], disabled: this.readonly}],
            toolDefaults: [{value: this.port.customProps["sbg:toolDefaultValue"], disabled: this.readonly}],
            fileTypes: [{value: this.port.fileTypes, disabled: this.readonly}]
        });

        this.tracked = this.form.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {

                if (this.isInputPort()) {
                    this.setTextProperty("sbg:altPrefix", value.altPrefix, true);
                    this.setTextProperty("sbg:category", value.category, true);
                    if (!this.isFileType()) {
                        this.setTextProperty("sbg:toolDefaultValue", value.toolDefaults, true);
                    }
                }

                if (value.fileTypes) {
                    this.setFileTypes(value.fileTypes);
                }

                this.setTextProperty("label", value.label);
                this.setTextProperty("description", value.description);

                this.propagateChange(this.port);
            });
    }

    private setTextProperty(propertyName: string, newValue: string, custom?: boolean): void {
        if (typeof newValue === "string") {
            if (custom) {
                if (newValue.length > 0) {
                    this.port.customProps[propertyName] = newValue;
                } else if (this.port.customProps[propertyName]) {
                    delete this.port.customProps[propertyName];
                }
            } else {
                this.port[propertyName] = newValue.length > 0 ? newValue : undefined;
            }
        }
    }

    private setFileTypes(fileTypes: string []): void {
        this.port.fileTypes = fileTypes || [];
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    isInputPort() {
        return this.port instanceof CommandInputParameterModel;
    }

    isFileType() {
        return this.port.type.type === "File" || this.port.type.items === "File";
    }

    setDisabledState(isDisabled: boolean): void {
        Object.keys(this.form.controls).forEach((item) => {
            const control = this.form.controls[item];
            isDisabled ? control.disable({onlySelf: true, emitEvent: false})
                : control.enable({onlySelf: true, emitEvent: false});
        });
    }
}
