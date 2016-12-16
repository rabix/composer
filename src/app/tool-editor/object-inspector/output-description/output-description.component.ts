import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandOutputParameterModel as OutputProperty} from "cwlts/models/d2sb";

require("./output-description.component.scss");

@Component({
    selector: 'output-description',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OutputDescriptionComponent), multi: true }
    ],
    template: `
<ct-form-panel [borderless]="true" [collapsed]="true">
    <div class="tc-header">Description</div>
    <div class="tc-body" *ngIf="output && descriptionFormGroup">
    
        <div class="secondary-text">
             This description will be visible when using the tool in the workflow editor.
             It's best to be concise and informative.
        </div>
        
        <div class="form-group">
            <label class="form-control-label">Label</label>
            <input type="text" 
                   class="form-control"
                   [formControl]="descriptionFormGroup.controls['label']">
        </div>
        
        <div class="form-group">
            <label class="form-control-label">Description</label>        
            <textarea class="form-control" 
                      rows="4"
                      [formControl]="descriptionFormGroup.controls['description']"></textarea>
        </div>
        
         <div *ngIf="output.type.type === 'File'">
            <label class="form-control-label">File types</label>
            <input class="form-control"
                   [formControl]="descriptionFormGroup.controls['fileTypes']"/>
         </div>
    </div> <!--tc-body-->
</ct-form-panel>
    `
})
export class OutputDescriptionComponent extends ComponentBase implements ControlValueAccessor {

    private output: OutputProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private descriptionFormGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: OutputProperty): void {
        this.output = output;

        this.descriptionFormGroup = this.formBuilder.group({
            label: [this.output.label],
            description: [this.output.description],
            fileTypes: [this.output.customProps["sbg:fileTypes"]]
        });

        this.tracked = this.descriptionFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {

                if (!!value.fileTypes) {
                    this.setFileTypes(value.fileTypes);
                } else if (this.output.customProps["sbg:fileTypes"]) {
                    delete this.output.customProps["sbg:fileTypes"];
                }

                this.setTextProperty('label', value.label);
                this.setTextProperty('description', value.description);

                this.propagateChange(this.output);
            });
    }

    private setTextProperty(propertyName: string, newValue: string): void {
        if (!!newValue) {
            const trimmedValue = newValue.trim();
            this.output[propertyName] = trimmedValue.length > 0 ? trimmedValue : undefined;
        }
    }

    private setFileTypes(fileTypes: string): void {
        const trimmedFileTypes = fileTypes.trim();

        if (trimmedFileTypes.length > 0) {
            this.output.customProps["sbg:fileTypes"] = trimmedFileTypes;
        } else {
            this.output.customProps["sbg:fileTypes"] = undefined;
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
