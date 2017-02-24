import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../../components/common/component-base";
import {CommandOutputParameterModel, SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {noop} from "../../../../lib/utils.lib";

require("./description.component.scss");

@Component({
    selector: 'ct-description-section',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DescriptionComponent), multi: true }
    ],
    template: `
<ct-form-panel class="borderless" [collapsed]="true">
    <div class="tc-header">Description</div>
    <div class="tc-body" *ngIf="port && descriptionFormGroup">
    
        <div class="form-text">
             This description will be visible when using the tool in the workflow editor.
             It's best to be concise and informative.
        </div>
        
        <!--Label-->
        <div class="form-group">
            <label class="form-control-label">Label</label>
            <input type="text" 
                   class="form-control"
                   [formControl]="descriptionFormGroup.controls['label']">
        </div>
        
        <!--Description-->
        <div class="form-group">
            <label class="form-control-label">Description</label>        
            <textarea class="form-control" 
                      rows="4"
                      [formControl]="descriptionFormGroup.controls['description']"></textarea>
        </div>
        
        <!--File Types-->
         <div *ngIf="isFileType()">
            <label class="form-control-label">File types</label>
            <input class="form-control"
                   [formControl]="descriptionFormGroup.controls['fileTypes']"/>
         </div>
    </div>
</ct-form-panel>
    `
})
export class DescriptionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    private port: CommandOutputParameterModel | SBDraft2CommandInputParameterModel;

    private onTouched = noop;

    private propagateChange = noop;

    private descriptionFormGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(port: CommandOutputParameterModel | SBDraft2CommandInputParameterModel): void {
        this.port = port;

        this.descriptionFormGroup = this.formBuilder.group({
            label: [{value: this.port.label, disabled: this.readonly}],
            description: [{value: this.port.description, disabled: this.readonly}],
            fileTypes: [{value: this.port.customProps["sbg:fileTypes"], disabled: this.readonly}]
        });

        this.tracked = this.descriptionFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {

                if (!!value.fileTypes) {
                    this.setFileTypes(value.fileTypes);
                } else if (this.port.customProps["sbg:fileTypes"]) {
                    delete this.port.customProps["sbg:fileTypes"];
                }

                this.setTextProperty('label', value.label);
                this.setTextProperty('description', value.description);

                this.propagateChange(this.port);
            });
    }

    private setTextProperty(propertyName: string, newValue: string): void {
        if (!!newValue) {
            const trimmedValue = newValue.trim();
            this.port[propertyName] = trimmedValue.length > 0 ? trimmedValue : undefined;
        }
    }

    private setFileTypes(fileTypes: string): void {
        const trimmedFileTypes = fileTypes.trim();

        if (trimmedFileTypes.length > 0) {
            this.port.customProps["sbg:fileTypes"] = trimmedFileTypes;
        } else {
            this.port.customProps["sbg:fileTypes"] = undefined;
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private isFileType() {
        return this.port.type.type === 'File' || (this.port.type.type === 'array' && this.port.type.items === 'File');
    }
}
