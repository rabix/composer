import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";
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
    <div class="tc-body" *ngIf="selectedProperty">
    
        <div class="secondary-text">
             This description will be visible when using the tool in the workflow editor.
             It's best to be concise and informative.
        </div>
        
        <div class="form-group" *ngIf="labelForm">
            <label>Label</label>
            <input type="text" 
                   class="form-control"
                   [formControl]="labelForm">
        </div>
        
        <div class="form-group" *ngIf="descriptionForm">
            <label>Description</label>        
            <textarea class="form-control" 
                      rows="4"
                      [formControl]="descriptionForm"></textarea>
        </div>
        
    </div> <!--tc-body-->
</ct-form-panel>
    `
})
export class InputDescriptionComponent extends ComponentBase implements ControlValueAccessor {

    private selectedProperty: InputProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private labelForm: FormControl;

    private descriptionForm: FormControl;

    constructor() {
        super();
    }

    private writeValue(property: InputProperty): void {
        this.selectedProperty = property;

        this.labelForm = new FormControl(this.selectedProperty.label);
        this.descriptionForm = new FormControl(this.selectedProperty.description);

        this.tracked = this.labelForm.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {
                const trimmedValue = value.trim();
                this.selectedProperty.label = trimmedValue.length > 0 ? trimmedValue: undefined;
                this.propagateChange(this.selectedProperty);
            });

        this.tracked = this.descriptionForm.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {
                const trimmedValue = value.trim();
                this.selectedProperty.description = trimmedValue.length > 0 ? trimmedValue: undefined;
                this.propagateChange(this.selectedProperty);
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
