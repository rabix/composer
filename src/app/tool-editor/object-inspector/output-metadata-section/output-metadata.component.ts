import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {
    CommandOutputParameterModel as OutputProperty
} from "cwlts/models/d2sb";

require("./output-metadata.component.scss");

@Component({
    selector: 'output-metadata-section',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OutputMetaDataSectionComponent), multi: true }
    ],
    template: `
<ct-form-panel *ngIf="output.type.type === 'File' || (output.type.type === 'array' && output.type.items === 'File')" 
    [borderless]="true" [collapsed]="true">
    
        <div class="tc-header">Metadata</div>
        <div class="tc-body" *ngIf="metadataForm">        
            <div class="form-group" *ngIf="metadataForm">
                <form> 
                                         
                    <!--Inherit Metadata field-->
                    <div class="form-group">                
                        <label class="form-control-label">Inherit</label>
                        <select class="form-control" 
                                [formControl]="metadataForm.controls['inheritMetadata']">    
                            <option value = "">-- none --</option>
                            <option *ngFor="let item of inputs" 
                                    [value]="item.id">
                                {{item.id}}
                            </option>
                        </select>
                    </div> 
                                     
                </form>
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

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private metadataForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: OutputProperty): void {
        this.output = output;

        this.metadataForm = this.formBuilder.group({
            inheritMetadata: [this.output.outputBinding.inheritMetadataFrom || ""]
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
                this.output.outputBinding.inheritMetadataFrom = change.inheritMetadata;
                this.propagateChange(change);
            });

    }
}
