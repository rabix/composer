import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {FormPanelComponent} from "../../../core/elements/form-panel.component";

require("./input-description.component.scss");

@Component({
    selector: 'input-description',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputDescriptionComponent), multi: true }
    ],
    directives: [
        FormPanelComponent
    ],
    template: `
<ct-form-panel>
    <div class="tc-header">Description</div>
    <div class="tc-body" *ngIf="input && descriptionFormGroup">
    
        <div class="secondary-text">
             This description will be visible when using the tool in the workflow editor.
             It's best to be concise and informative.
        </div>
        
        <div class="form-group">
            <label>Label</label>
            <input type="text" 
                   class="form-control"
                   [formControl]="descriptionFormGroup.controls['label']">
        </div>
        
        <div class="form-group">
            <label>Description</label>        
            <textarea class="form-control" 
                      rows="4"
                      [formControl]="descriptionFormGroup.controls['description']"></textarea>
        </div>
        
         <div *ngIf="input.type.type === 'File'">
            <label>File types</label>
            <input class="form-control"
                   [formControl]="descriptionFormGroup.controls['fileTypes']"/>
         </div>
    </div> <!--tc-body-->
</ct-form-panel>
    `
})
export class InputDescriptionComponent extends ComponentBase implements ControlValueAccessor {

    private input: InputProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private descriptionFormGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private writeValue(input: InputProperty): void {
        this.input = input;

        this.descriptionFormGroup = this.formBuilder.group({
            label: [this.input.label],
            description: [this.input.description],
            fileTypes: [""]
        });

        this.tracked = this.descriptionFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {

                if (!!value.fileTypes) {
                    this.setFileTypes(value.fileTypes);
                } else if (this.input.customProps["sbg:fileTypes"]) {
                    delete this.input.customProps["sbg:fileTypes"];
                }

                this.setTextProperty('label', value.label);
                this.setTextProperty('description', value.description);

                this.propagateChange(this.input);
            });
    }

    private setTextProperty(propertyName: string, newValue: string): void {
        if (!!newValue) {
            const trimmedValue = newValue.trim();
            this.input[propertyName] = trimmedValue.length > 0 ? trimmedValue : undefined;
        }
    }

    private setFileTypes(fileTypes: string): void {
        const trimmedFileTypes = fileTypes.trim();

        if (trimmedFileTypes.length > 0) {
            this.input.customProps["sbg:fileTypes"] = trimmedFileTypes;
        } else {
            delete this.input.customProps["sbg:fileTypes"];
        }
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
