import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    ViewEncapsulation,
    OnInit, SimpleChanges, OnChanges
} from "@angular/core";
import {
    WorkflowInputParameterModel,
    WorkflowModel,
    WorkflowOutputParameterModel
} from "cwlts/models";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {Workflow} from "cwl-svg";

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-workflow-io-inspector",
    styleUrls: ["./workflow-io-inspector.components.scss"],
    template: `
        <!--Required-->
        <div *ngIf="isInputPort()" class="form-group flex-container">
            <label>Required</label>
            <span class="align-right">
                        <ct-toggle-slider [formControl]="form.controls['isRequired']"
                                          [off]="'No'"
                                          [on]="'Yes'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
        </div>

        <!--ID-->
        <div class="form-group" [class.has-danger]="form.controls['id'].errors">
            <label class="form-control-label">ID</label>
            <input type="text"
                   class="form-control"
                   [formControl]="form.controls['id']">
            <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                {{form.controls['id'].errors['error']}}
            </div>
        </div>

        <!--Connections-->
        <div *ngIf="!isInputPort()">

            <!--No connections-->
            <div *ngIf="port['source'].length === 0">
                <span class="text-warning small">
                    <i class="fa fa-warning fa-fw"></i> This port is not connected
                </span>
            </div>

            <!--List of connections-->
            <div *ngIf="port['source'].length > 0" class="text-muted small">
                Connections: {{ port['source'].join(", ") }}
            </div>
        </div>

        <!--Label-->
        <div class="form-group">
            <label class="form-control-label">Label</label>
            <input type="text"
                   class="form-control"
                   [formControl]="form.controls['label']">
        </div>

        <!--Input Type -->
        <ct-input-type-select [formControl]="form.controls['typeForm']"
                              [propertyTypes]="propertyTypes"
                              [itemTypes]="itemTypes"></ct-input-type-select>

        <!--Symbols-->
        <ct-symbols-section class="form-group"
                            *ngIf="isEnumType()"
                            [formControl]="form.controls['symbols']"
                            [readonly]="readonly">
        </ct-symbols-section>

        <!--File Types-->
        <div *ngIf="isFileType() && isInputPort()">
            <label class="form-control-label">File types</label>
            <ct-auto-complete [formControl]="form.controls['fileTypes']"
                              [create]="true"></ct-auto-complete>
        </div>

        <!--Batch group-->
        <div class="form-group" *ngIf="workflowModel.hasBatch && isInputPort()">

            <label class="form-control-label">Create batch group

                <span class="text-warning small" *ngIf="customValueIsNotSelected()">
                      <i class="fa fa-warning fa-fw" [ct-tooltip]="ctt"></i>
                </span>
 
                <ct-tooltip-content #ctt>
                    <div class="tooltip-info">
                        This workflow has a batch criteria which has been set via the API. If you change it,
                        you won't be able to restore the custom batch criteria afterwards.
                    </div>
                </ct-tooltip-content>

            </label>

            <!--Batch select-->
            <select class="form-control" *ngIf="!workflowModel.batchInput || workflowModel.batchInput === port.id"
                    [formControl]="form.controls['batchType']">
                <option *ngFor="let propertyType of batchByList" [ngValue]="propertyType.value">
                    {{propertyType.label}}
                </option>
            </select>

            <!--Warning when some other input is already configured as batch-->
            <div class="text-warning small"
                 *ngIf="workflowModel.batchInput && workflowModel.batchInput !== port.id">
                <i class="fa fa-warning fa-fw"></i>
                Only one input per workflow can be configured as batch. Grouping criteria has already been set on
                #{{workflowModel['batchInput']}}.
            </div>
        </div>

        <!--Description-->
        <div class="form-group">
            <label class="form-control-label">Description</label>
            <textarea class="form-control"
                      rows="4"
                      [formControl]="form.controls['description']"></textarea>
        </div>

    `

})
export class WorkflowIOInspectorComponent extends DirectiveBase implements OnInit, OnChanges {

    public propertyTypes = ["array", "enum", "File", "string", "int", "float", "boolean"];

    public itemTypes = ["File", "string", "int", "float", "boolean"];

    public batchByList: { label: string, value: string | string [] } [] =
        [
            {
                label: 'None',
                value: 'none'
            },
            {
                label: 'File',
                value: 'item'
            },
            {
                label: 'Sample',
                value: ['metadata.sample_id']
            },
            {
                label: 'Case',
                value: ['metadata.case_id']
            },
            {
                label: 'Library (Sample + Library)',
                value: ['metadata.sample_id', 'metadata.library_id']
            },
            {
                label: 'Platform unit (Sample + Library + Platform unit)',
                value: ['metadata.sample_id', 'metadata.library_id', 'metadata.platform_unit_id']
            },
            {
                label: 'File segment (Sample + Library + Platform unit + File segment)',
                value: ['metadata.sample_id', 'metadata.library_id', 'metadata.platform_unit_id', 'metadata.file_segment_number']
            }
        ];

    // Initial batchByList length (to know if there is a custom value by comparing this value and current list length)
    private batchByListInitialLength = this.batchByList.length;

    // Value in batchByList that should be selected in DOM. This is added in order to solve the problem when we have
    // a custom value for batch by (when you type it manually in Code mode). We need this because of array values
    // (other way it will not preselect the value in DOM select input)
    private selectedBatchByOption;

    @Input()
    public port: WorkflowInputParameterModel | WorkflowOutputParameterModel;

    @Input()
    public workflowModel: WorkflowModel;

    @Input()
    public readonly = false;

    @Input()
    public graph: Workflow;

    form: FormGroup;

    private initSymbolsList: string[] = [];

    constructor(private formBuilder: FormBuilder, private cdr: ChangeDetectorRef) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {

        if (this.form) {

            if (changes["port"]) {
                const newIO = changes["port"].currentValue;
                if (!newIO) { // Happens when you go through wf history to the beginning
                    return;
                }

                this.form.patchValue({
                    isRequired: !newIO.type.isNullable,
                    id: newIO.id,
                    label: newIO.label,
                    typeForm: newIO.type,
                    symbols: newIO.type.symbols || this.initSymbolsList,
                    description: newIO.description,
                    fileTypes: newIO.fileTypes
                });
            }

            if (changes["workflow"]) {
                // If there was a custom value in batchByList and model is changed (Undo/Redo...) we have to remove that
                // custom value from batchByList
                if (this.batchByListInitialLength > this.batchByList.length) {
                    this.batchByList.pop();
                }
                this.selectedBatchByOption = this.findBatchValueInTheList(this.workflowModel["batchByValue"]);
                this.form.controls["batchType"].setValue(this.selectedBatchByOption);
            }
        }
    }

    /**
     * Return value of an option in batchByList that should be selected
     */
    findBatchValueInTheList(batchTypeValue: string | string []): string | string [] {

        if (!batchTypeValue) {
            // None value
            return this.batchByList.find((item) => item.value === 'none').value;
        }

        // Find if batchTypeValue is in batchByList
        const criteriaInList = this.batchByList.find((batchBy) => {
            if (Array.isArray(batchBy.value) && Array.isArray(batchTypeValue)) {
                return batchBy.value.slice().sort().toString() === batchTypeValue.slice().sort().toString();
            } else {
                return batchBy.value === batchTypeValue;
            }
        });

        if (criteriaInList) {
            return criteriaInList.value;
        } else {
            // If its a custom value, should be added to a list
            this.batchByList.push({
                label: "Api: " + batchTypeValue,
                value: batchTypeValue
            });
            return batchTypeValue;
        }
    }

    ngOnInit() {

        this.selectedBatchByOption = this.findBatchValueInTheList(this.workflowModel["batchByValue"]);

        this.form = this.formBuilder.group({
            isRequired: [!this.port.type.isNullable],
            id: [{value: this.port.id, disabled: this.readonly}],
            label: [{value: this.port.label, disabled: this.readonly}],
            typeForm: [{value: this.port.type, disabled: this.readonly}],
            symbols: [this.port.type.symbols || this.initSymbolsList],
            description: [{value: this.port.description, disabled: this.readonly}],
            fileTypes: [{value: this.port.fileTypes, disabled: this.readonly}],
            batchType: [{value: this.selectedBatchByOption, disabled: this.readonly}]
        });

        this.tracked = this.form.controls["isRequired"].valueChanges.subscribe((value) => {
            this.port.type.isNullable = !value;
        });

        this.tracked = this.form.controls["id"].valueChanges.debounceTime(1000).subscribe((value) => {
            try {
                // Change id on workflow model so canvas can interact with it
                this.workflowModel.changeIONodeId(this.port, value);
                this.graph.redraw();

                if (this.isEnumType()) {
                    this.port.type.name = value;
                }
            } catch (e) {
                this.form.controls["id"].setErrors({error: e.message});
                // Because this comes outside of Angular (workflow model)
                this.cdr.markForCheck();
            }
        });

        this.tracked = this.form.controls["symbols"].valueChanges.subscribe((value) => {
            if (value.length > 0 && this.isEnumType()) {
                this.port.type.symbols = value;
            }
        });

        this.tracked = this.form.controls["fileTypes"].valueChanges.subscribe((value) => {
            this.port.fileTypes = value || [];
        });

        this.tracked = this.form.controls["label"].valueChanges.debounceTime(1000).subscribe((label) => {
            this.port.label = label;
            this.graph.redraw();
        });

        this.tracked = this.form.controls["description"].valueChanges.subscribe((description) => {
            this.port.description = description;
        });

        this.tracked = this.form.controls["batchType"].valueChanges.subscribe((batchType) => {
            this.selectedBatchByOption = batchType;
            this.workflowModel.setBatch(this.port.id, batchType);
        });

    }

    /**
     * Return true if there is a custom value in batchByList and that value is not selected
     */
    customValueIsNotSelected() {
        return (this.batchByList.length > this.batchByListInitialLength)
            && (this.selectedBatchByOption !== this.batchByList[this.batchByList.length - 1].value);
    }

    isInputPort() {
        return this.port instanceof WorkflowInputParameterModel;
    }

    isEnumType() {
        return this.port.type.type === "enum" || (this.port.type.type === "array" && this.port.type.items === "enum");
    }

    isFileType() {
        return this.port.type.type === "File" || (this.port.type.type === "array" && this.port.type.items === "File");
    }
}
