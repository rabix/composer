import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, FormGroup,
    NG_VALUE_ACCESSOR
} from "@angular/forms";
import {CommandInputParameterModel, CommandOutputParameterModel} from "cwlts/models";
import {SBDraft2CommandOutputParameterModel, SBDraft2ExpressionModel} from "cwlts/models/d2sb";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-output-metadata-section",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => OutputMetaDataSectionComponent),
            multi: true
        }
    ],
    template: `
        <ct-form-panel
                *ngIf="output.type.type === 'File' || (output.type.type === 'array' && output.type.items === 'File')"
                class="borderless" [collapsed]="true">

            <div class="tc-header">Metadata</div>
            <div class="tc-body" *ngIf="metadataForm">
                <div class="form-group" *ngIf="metadataForm">
                    <form>

                        <!--Inherit Metadata field-->
                        <div class="form-group" *ngIf="metadataForm.controls['inheritMetadata']">
                            <label class="form-control-label">Inherit</label>
                            <select class="form-control"
                                    [formControl]="metadataForm.controls['inheritMetadata']">
                                <option value="" [disabled]="readonly">-- none --</option>
                                <option *ngFor="let item of inputs"
                                        [disabled]="readonly"
                                        [value]="item.id">
                                    {{item.id}}
                                </option>
                            </select>
                        </div>


                        <!--@todo Replace this key-value-list-->
                        <ct-key-value-list
                                *ngIf="metadataForm.controls['metadataList']"
                                [addEntryText]="'Add Metadata'"
                                [emptyListText]="'No metadata defined.'"
                                [formControl]="metadataForm.controls['metadataList']">
                        </ct-key-value-list>

                    </form>
                </div>
            </div>

        </ct-form-panel>
    `
})
export class OutputMetaDataSectionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    inputs: CommandInputParameterModel[] = [];

    output: CommandOutputParameterModel;

    private onTouched = noop;

    private propagateChange = noop;

    metadataForm: FormGroup;

    readonly = false;

    private keyValueFormList: { key: string, value: string | SBDraft2ExpressionModel }[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: SBDraft2CommandOutputParameterModel): void {
        this.output       = output;
        this.metadataForm = new FormGroup({});

        if (output.outputBinding.hasMetadata) {
            this.keyValueFormList = Object.keys(this.output.outputBinding.metadata)
                .map(key => {
                    return {
                        key: key,
                        value: this.output.outputBinding.metadata[key]
                    };
                });

            this.metadataForm.addControl("metadataList", new FormControl({
                value: this.keyValueFormList,
                disabled: this.readonly
            }));
        }

        if (output.outputBinding.hasInheritMetadata) {
            this.metadataForm.addControl("inheritMetadata",
                new FormControl(this.output.outputBinding.inheritMetadataFrom));
        }


        this.listenToFormChanges();
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private listenToFormChanges(): void {
        this.tracked = this.metadataForm.valueChanges
            .debounceTime(300)
            .subscribe(change => {
                let hasChanged = false;

                if (change.metadataList) {
                    const metadataObject = {};

                    change.metadataList.forEach((item: { key: string, value: SBDraft2ExpressionModel }) => {
                        metadataObject[item.key] = item.value;
                    });

                    this.output.outputBinding.metadata = metadataObject;
                    hasChanged = true;
                }

                if (change.inheritMetadata || this.output.outputBinding.hasInheritMetadata) {
                    this.output.outputBinding.setInheritMetadataFrom(change.inheritMetadata);
                    hasChanged = true;
                }

                if (hasChanged) {
                    this.propagateChange(change);
                }
            });
    }

    setDisabledState(isDisabled: boolean): void {
        this.readonly = isDisabled;
        isDisabled ? this.metadataForm.controls["metadataList"].disable() : this.metadataForm.controls["metadataList"].enable();
    }
}
