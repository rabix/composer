import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder} from "@angular/forms";
import {ComponentBase} from "../../../../components/common/component-base";
import {CommandInputParameterModel, CommandOutputParameterModel as OutputProperty, ExpressionModel} from "cwlts/models/d2sb";

require("./output-metadata.component.scss");

@Component({
    selector: 'ct-output-metadata-section',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OutputMetaDataSectionComponent), multi: true }
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
                    [formControl]="metadataForm.controls['metadataList']"></key-value-list>
        </div>
    </div>

</ct-form-panel>
`
})
export class OutputMetaDataSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    /** The currently displayed property */
    private output: OutputProperty;

    private onTouched = () => {
    };

    private propagateChange = (_) => {
    };

    private metadataForm: FormGroup;

    private keyValueFormList: {key: string, value: string | ExpressionModel}[] = [];

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
            inheritMetadata: [this.output.outputBinding.inheritMetadataFrom || ""],
            metadataList: [this.keyValueFormList]
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

                change.metadataList.forEach((item: {key: string, value: ExpressionModel}) => {
                    metadataObject[item.key] = item.value;
                });

                this.output.outputBinding.metadata = metadataObject;
                this.output.outputBinding.inheritMetadataFrom = change.inheritMetadata;
                this.propagateChange(change);
            });
    }
}
