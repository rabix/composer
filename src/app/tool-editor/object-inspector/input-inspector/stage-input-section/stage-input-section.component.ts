import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CommandInputParameterModel} from "cwlts/models";
import {V1CommandInputParameterModel} from "cwlts/models/v1.0";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-stage-input",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => StageInputSectionComponent),
            multi: true
        }
    ],
    template: `
        <ct-form-panel *ngIf="form" class="borderless" [collapsed]="true">
            <div *ngIf="cwlVersion !== 'v1.0'" class="tc-header">Stage Input</div>
            <div *ngIf="cwlVersion === 'v1.0'" class="tc-header">Load Content</div>
            <div class="tc-body" *ngIf="input && form">

                <div class="form-group" *ngIf="form.controls['stageInput']">
                    <label>Stage Input</label>
                    <select class="form-control"
                            [formControl]="form.controls['stageInput']">

                        <option *ngFor="let item of stageInputOptions"
                                [disabled]="readonly"
                                [value]="item.value">
                            {{item.text}}
                        </option>
                    </select>
                </div>


                <div class="form-group flex-container" *ngIf="isFileType()">
                    <label>Load Content</label>
                    <span class="align-right">
                    <ct-toggle-slider [formControl]="form.controls['loadContent']">
                    </ct-toggle-slider>
                </span>
                </div>

            </div> <!--tc-body-->
        </ct-form-panel>
    `
})

export class StageInputSectionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    input: CommandInputParameterModel;

    cwlVersion: string;

    private onTouched = noop;

    private propagateChange = noop;

    form: FormGroup;

    stageInputOptions: { text: string, value: string }[] = [
        {text: "-- none --", value: null},
        {text: "Copy", value: "copy"},
        {text: "Link", value: "link"}
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: CommandInputParameterModel): void {
        this.input = input;

        this.cwlVersion = input instanceof V1CommandInputParameterModel ? "v1.0" : "sbg:draft-2";

        this.form = this.formBuilder.group({
            loadContent: [!!this.input.inputBinding && this.input.inputBinding.loadContents ? this.input.inputBinding.loadContents : false]
        }, {onlySelf: true});

        if (this.input.hasStageInput) {
            this.form.addControl("stageInput", new FormControl(this.input.customProps["sbg:stageInput"] || null));
        }

        this.tracked = this.form.valueChanges
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

    isFileType() {
        return this.input.type.type === "File" || this.input.type.items === "File";
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.readonly = isDisabled;
        isDisabled ? this.form.controls["loadContent"].disable({onlySelf: true, emitEvent: false})
            : this.form.controls["loadContent"].enable({onlySelf: true, emitEvent: false});
    }
}
