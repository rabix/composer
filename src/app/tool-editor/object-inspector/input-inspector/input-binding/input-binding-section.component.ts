import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {CommandLineBindingModel, SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../../components/common/component-base";
import {noop} from "../../../../lib/utils.lib";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "input-binding-section",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputBindingSectionComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => InputBindingSectionComponent),
            multi: true
        }
    ],

    template: `
        <div class="form-group" *ngIf="inputBindingFormGroup && propertyType">

            <div class="form-group" *ngIf="!isRecordType()">
                <label class="form-control-label">Value</label>
                <ct-expression-input
                    [context]="context"
                    [readonly]="readonly"
                    [formControl]="inputBindingFormGroup.controls['valueFrom']"
                    [disableLiteralTextInput]="true">
                </ct-expression-input>
            </div>

            <div class="form-group">
                <label class="form-control-label">Position</label>
                <input class="form-control"
                       type="number"
                       [ct-disabled]="readonly"
                       [formControl]="inputBindingFormGroup.controls['position']"/>
            </div>

            <div class="form-group">
                <label class="form-control-label">Prefix</label>
                <input class="form-control"
                       [ct-disabled]="isRecordType() || readonly"
                       [formControl]="inputBindingFormGroup.controls['prefix']"/>
            </div>

            <div class="form-group flex-container">
                <label>Prefix and value separation</label>
                <span class="align-right">
                    <ct-toggle-slider
                        [ct-disabled]="isRecordType()"
                        [formControl]="inputBindingFormGroup.controls['separate']"
                        [on]="'Separate'"
                        [readonly]="readonly"
                        [off]="'Join'"></ct-toggle-slider>
                </span>
            </div>

            <div class="form-group" *ngIf="propertyType === 'array'">
                <label class="form-control-label">Item Seperator</label>
                <select class="form-control"
                        [ct-disabled]="isRecordType()"
                        [formControl]="inputBindingFormGroup.controls['itemSeparator']">
                    <option *ngFor="let itemSeparator of itemSeparators" [value]="itemSeparator.value">
                        {{itemSeparator.text}}
                    </option>
                </select>
            </div>

            <ct-stage-input *ngIf="isRecordType() || isFileType()"
                            [formControl]="inputBindingFormGroup.controls['stageInputSection']"
                            [readonly]="readonly">
            </ct-stage-input>

            <ct-secondary-file *ngIf="isFileType()"
                               [formControl]="inputBindingFormGroup.controls['secondaryFilesSection']"
                               [context]="context"
                               [readonly]="readonly">
            </ct-secondary-file>
        </div>
    `
})
export class InputBindingSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    /** The type of the property as an input, so we can react to changes in the component */
    @Input()
    public propertyType: string;

    @Input()
    public context: { $job?: any, $self?: any } = {};

    private input: SBDraft2CommandInputParameterModel;

    private inputBindingFormGroup: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    //@todo add itemSeparator field for type array
    private itemSeparators: { text: string, value: string }[] = [
        {text: "equal", value: "="},
        {text: "comma", value: ","},
        {text: "semicolon", value: ";"},
        {text: "space", value: " "},
        {text: "repeat", value: null}
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: SBDraft2CommandInputParameterModel): void {
        this.input = input;

        if (!!this.input.inputBinding) {
            this.createInputBindingForm(this.input);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    validate() {
        if (!!this.inputBindingFormGroup) {
            return this.inputBindingFormGroup.valid ? null : {error: "Input binding section is not valid."}
        }
    }

    private createInputBindingForm(input: SBDraft2CommandInputParameterModel): void {
        this.inputBindingFormGroup = this.formBuilder.group({
            stageInputSection: [input],
            secondaryFilesSection: [input.inputBinding.secondaryFiles || []],
            valueFrom: [input.inputBinding.valueFrom, [Validators.required]],
            position: [input.inputBinding.position, [Validators.pattern(/^\d+$/)]],
            prefix: [input.inputBinding.prefix],
            separate: [input.inputBinding.separate !== false],
            itemSeparator: [!!input.inputBinding.itemSeparator ? input.inputBinding.itemSeparator : null]
        });

        this.listenToInputBindingFormChanges();
    }

    private listenToInputBindingFormChanges(): void {
        this.tracked = this.inputBindingFormGroup.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(value => {
                const serializedFiles = value.secondaryFilesSection.map(file => file.serialize());

                const binding = {
                    position: value.position || undefined,
                    prefix: value.prefix || undefined,
                    separate: value.separate,
                    itemSeparator: value.itemSeparator || undefined,
                    valueFrom: value.valueFrom.serialize(),
                    loadContents: value.stageInputSection.inputBinding.loadContents,
                    secondaryFiles: serializedFiles
                };


                if (!this.readonly) {
                    this.input.inputBinding = new CommandLineBindingModel(binding);
                    Object.assign(this.input.customProps, value.stageInputSection.customProps);

                    this.propagateChange(this.input);
                }

            });
    }

    private isFileType() {
        return this.propertyType === "File" || (this.propertyType === "array" && this.input.type.items === "File");
    }

    private isRecordType() {
        return this.propertyType === "record" || (this.propertyType === "array" && this.input.type.items === "record");
    }
}
