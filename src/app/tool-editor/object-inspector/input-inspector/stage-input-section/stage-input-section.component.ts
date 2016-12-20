import {Component, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../../../components/common/component-base";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

@Component({
    selector: 'stage-input',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StageInputSectionComponent), multi: true }
    ],
    template: `
<ct-form-panel *ngIf="input.type.type === 'record' || input.type.type === 'File'" [borderless]="true" [collapsed]="true">
    <div class="tc-header">Stage Input</div>
    <div class="tc-body" *ngIf="input && stageInputFormGroup">
    
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
                
           
           <div class="form-group flex-container" *ngIf="input.type.type === 'File'">
                <label>Load Content</label>
                <span class="align-right">
                    <toggle-slider [formControl]="stageInputFormGroup.controls['loadContent']"
                                   [off]="'No'" 
                                   [on]="'Yes'"></toggle-slider>
                </span>
           </div>
       
    </div> <!--tc-body-->
</ct-form-panel>
    `
})

export class StageInputSectionComponent extends ComponentBase implements ControlValueAccessor {

    private input: InputProperty;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private stageInputFormGroup: FormGroup;

    private stageInputOptions: {text: string, value: string}[] = [
        { text: "-- none --", value: null },
        { text: "Copy", value: "copy" },
        { text: "Link", value: "link" }
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: InputProperty): void {
        this.input = input;

        this.stageInputFormGroup = this.formBuilder.group({
            stageInput: [this.input.customProps["sbg:stageInput"] || ""],
            loadContent: [!!this.input.inputBinding && this.input.inputBinding.loadContents ? this.input.inputBinding.loadContents: false]
        });

        this.tracked = this.stageInputFormGroup.valueChanges
            .distinctUntilChanged()
            .subscribe(value => {
                if (!!value.stageInput) {
                    this.input.customProps["sbg:stageInput"] = value.stageInput;
                } else if (this.input.customProps["sbg:stageInput"]) {
                    delete this.input.customProps["sbg:stageInput"];
                }

                this.input.inputBinding.loadContents = value.loadContent;
                this.propagateChange(this.input);
            });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
