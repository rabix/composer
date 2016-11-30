import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";
import {FormPanelComponent} from "../../../core/elements/form-panel.component";

@Component({
    selector: 'stage-input',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StageInputSectionComponent), multi: true }
    ],
    directives: [
        FormPanelComponent
    ],
    template: `
<ct-form-panel *ngIf="selectedProperty.type.type === 'record' || selectedProperty.type.type === 'File'">
    <div class="tc-header">Stage Input</div>
    <div class="tc-body" *ngIf="selectedProperty && stageInputFormGroup">
    
            <div class="form-group">
                <label>Stage Input</label>
                <select class="form-control" 
                        [formControl]="stageInputFormGroup.controls['stageInput']">
                       
                    <option *ngFor="let item of stageInputOptions" 
                            [value]="item.value">
                        {{item.text}}
                    </option>
                </select>
            </div>
                
            
           <!-- 
           TODO
           <div class="form-group flex-container *ngIf="selectedProperty.type.type === 'File'">
                <label>Load Content</label>
                <span class="align-right">
                    {{selectedProperty.inputBinding.loadContents ? "Yes" : "No"}}
                    <toggle-slider [formControl]="stageInputFormGroup.controls['loadContent']"></toggle-slider>
                </span>
            </div>-->
       
    </div> <!--tc-body-->
</ct-form-panel>
    `
})

/**
 * TODO: add the load content property on the model
 * */
export class StageInputSectionComponent extends ComponentBase implements ControlValueAccessor {

    private selectedProperty: InputProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private stageInputFormGroup: FormGroup;

    private stageInputOptions: {text: string, value: string}[] = [
        { text: "-- none --", value: "" },
        { text: "Copy", value: "copy" },
        { text: "Link", value: "link" }
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private writeValue(property: InputProperty): void {
        this.selectedProperty = property;

        this.stageInputFormGroup = this.formBuilder.group({
            stageInput: [this.selectedProperty["sbg:sbg:stageInput"] || ""],
            //TODO: add load content
            //loadContent: []
        });

        this.tracked = this.stageInputFormGroup.valueChanges
            .distinctUntilChanged()
            .subscribe(value => {
                if (!!value.stageInput) {
                    this.selectedProperty["sbg:stageInput"] = value.stageInput;
                } else if (this.selectedProperty["sbg:stageInput"]) {
                    delete this.selectedProperty["sbg:stageInput"];
                }

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
