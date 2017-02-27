import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ComponentBase} from "../../../../components/common/component-base";
import {CommandOutputParameterModel as OutputProperty, ExpressionModel, SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {noop} from "../../../../lib/utils.lib";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-output-metadata-section",
    styleUrls: ["./output-metadata.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OutputMetaDataSectionComponent), multi: true}
    ],
    template: `
        <ct-form-panel *ngIf="output.type.type === 'File' || (output.type.type === 'array' && output.type.items === 'File')"
                       class="borderless" [collapsed]="true">

            <div class="tc-header">Metadata</div>
            <div class="tc-body" *ngIf="metadataForm">
                <div class="form-group" *ngIf="metadataForm">
                    <form>

                        <!--Inherit Metadata field-->
                        <div class="form-group">
                            <label class="form-control-label">Inherit</label>
                            <select class="form-control" [formControl]="metadataForm.controls['inheritMetadata']">
                                <option value="">-- none --</option>
                                <option *ngFor="let item of inputs" [value]="item.id">
                                    {{item.id}}
                                </option>
                            </select>
                        </div>

                    </form>


                    <key-value-list
                        [addEntryText]="'Add Metadata'"
                        [emptyListText]="'No metadata defined.'"
                        [context]="context"
                        [formControl]="metadataForm.controls['metadataList']"
                        [readonly]="readonly">
                    </key-value-list>
                </div>
            </div>

        </ct-form-panel>
    `
})
export class OutputMetaDataSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    @Input()
    public inputs: SBDraft2CommandInputParameterModel[] = [];

    /** The currently displayed property */
    private output: OutputProperty;

    private onTouched = noop;

    private propagateChange = noop;

    private metadataForm: FormGroup;

    private keyValueFormList: { key: string, value: string | ExpressionModel }[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: OutputProperty): void {
        this.output = output;

        this.keyValueFormList = Object.keys(this.output.outputBinding.metadata)
            .map(key => {
                return {
                    key: key,
                    value: this.output.outputBinding.metadata[key]
                }
            });

        this.metadataForm = this.formBuilder.group({
            inheritMetadata: [{value: this.output.outputBinding.inheritMetadataFrom || "", disabled: this.readonly}],
            metadataList: [{value: this.keyValueFormList, disabled: this.readonly}]
        });

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
                const metadataObject = {};

                change.metadataList.forEach((item: { key: string, value: ExpressionModel }) => {
                    metadataObject[item.key] = item.value;
                });

                this.output.outputBinding.metadata = metadataObject;
                this.output.outputBinding.inheritMetadataFrom = change.inheritMetadata;
                this.propagateChange(change);
            });
    }
}
