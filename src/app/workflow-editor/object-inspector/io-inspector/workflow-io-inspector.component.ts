import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Workflow} from "cwl-svg";
import {WorkflowInputParameterModel, WorkflowModel, WorkflowOutputParameterModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

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
                        <ct-toggle-slider data-test="required-toggle"
                                          [formControl]="form.controls['isRequired']"
                                          [off]="'No'"
                                          [on]="'Yes'">
                        </ct-toggle-slider>
                    </span>
        </div>

        <!--ID-->
        <div class="form-group" [class.has-danger]="form.controls['id'].errors">
            <label class="form-control-label">ID</label>
            <input type="text"
                   class="form-control"
                   data-test="id-field"
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
                   data-test="label-field"
                   (blur)="labelUpdate($event)"
                   [formControl]="form.controls['label']">
        </div>

        <!--Input Type -->
        <ct-type-select [formControl]="form.controls['typeForm']"></ct-type-select>

        <!--Symbols-->
        <div class="form-group"
             *ngIf="isEnumType()">
            <label>Symbols</label>
            <ct-auto-complete data-test="symbols-field"
                              [create]="true"
                              [formControl]="form.controls['symbols']"></ct-auto-complete>
        </div>

        <!--File Types-->
        <div *ngIf="isFileType()">
            <label class="form-control-label">File types</label>
            <ct-auto-complete data-test="file-types-field"
                              [formControl]="form.controls['fileTypes']"
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
            <select class="form-control" 
                    data-test="batch-select"
                    *ngIf="!workflowModel.batchInput || workflowModel.batchInput === port.id"
                    [formControl]="form.controls['batchType']">
                <option *ngFor="let propertyType of batchByList"
                        [disabled]="readonly"
                        [ngValue]="propertyType.value">
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
                      data-test="desc-field"
                      [formControl]="form.controls['description']"></textarea>
        </div>

    `

})
export class WorkflowIOInspectorComponent extends DirectiveBase implements OnInit, OnChanges {

    batchByList: { label: string, value: string | string [] } [] =
        [
            {
                label: "None",
                value: "none"
            },
            {
                label: "File",
                value: "item"
            },
            {
                label: "Sample",
                value: ["metadata.sample_id"]
            },
            {
                label: "Case",
                value: ["metadata.case_id"]
            },
            {
                label: "Library (Sample + Library)",
                value: ["metadata.sample_id", "metadata.library_id"]
            },
            {
                label: "Platform unit (Sample + Library + Platform unit)",
                value: ["metadata.sample_id", "metadata.library_id", "metadata.platform_unit_id"]
            },
            {
                label: "File segment (Sample + Library + Platform unit + File segment)",
                value: ["metadata.sample_id", "metadata.library_id", "metadata.platform_unit_id", "metadata.file_segment_number"]
            }
        ];

    // Initial batchByList length (to know if there is a custom value by comparing this value and current list length)
    private batchByListInitialLength = this.batchByList.length;

    // Value in batchByList that should be selected in DOM. This is added in order to solve the problem when we have
    // a custom value for batch by (when you type it manually in Code mode). We need this because of array values
    // (other way it will not preselect the value in DOM select input)
    private selectedBatchByOption;

    @Input()
    port: WorkflowInputParameterModel | WorkflowOutputParameterModel;

    @Input()
    workflowModel: WorkflowModel;

    disabled = false;

    get readonly(): boolean {
        return this.disabled;
    }

    @Input("readonly")
    set readonly(value: boolean) {
        this.disabled = value;
        if (this.form) {
            this.setDisabledState(value);
        }
    }

    @Input()
    graph: Workflow;

    @Output()
    change = new EventEmitter<any>();

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
            return this.batchByList.find((item) => item.value === "none").value;
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
            isRequired: [{value: !this.port.type.isNullable, disabled: this.readonly}],
            id: [{value: this.port.id, disabled: this.readonly}],
            label: [{value: this.port.label, disabled: this.readonly}],
            typeForm: [{value: this.port.type, disabled: this.readonly}],
            symbols: [{value: this.port.type.symbols || this.initSymbolsList, disabled: this.readonly}],
            description: [{value: this.port.description, disabled: this.readonly}],
            fileTypes: [{value: this.port.fileTypes, disabled: this.readonly}],
            batchType: [this.selectedBatchByOption]
        });

        this.form.valueChanges.debounceTime(500).subscribeTracked(this, () => {
            this.change.emit();
        });

        this.form.controls["isRequired"].valueChanges.subscribeTracked(this, (value) => {
            this.port.type.isNullable = !value;
        });

        this.form.controls["id"].valueChanges.debounceTime(1000).subscribeTracked(this, (value) => {
            try {
                if (this.port.id === value) {
                    return;
                }

                // Change id on workflow model so canvas can interact with it
                this.workflowModel.changeIONodeId(this.port, value);
                this.graph.draw();

                if (this.isEnumType()) {
                    this.port.type.name = value;
                }
            } catch (e) {
                this.form.controls["id"].setErrors({error: e.message});
                // Because this comes outside of Angular (workflow model)
                this.cdr.markForCheck();
            }
        });

        this.form.controls["symbols"].valueChanges.subscribeTracked(this, (value) => {
            if (value.length > 0 && this.isEnumType()) {
                this.port.type.symbols = value;
            }
        });

        this.form.controls["typeForm"].valueChanges.subscribeTracked(this, (value) => {
            this.workflowModel.validateConnectionsForIOPort(this.port);
        });

        this.form.controls["fileTypes"].valueChanges.subscribeTracked(this, (value) => {
            this.port.fileTypes = value || [];
            this.workflowModel.validateConnectionsForIOPort(this.port);
        });

        this.form.controls["description"].valueChanges.subscribeTracked(this, (description) => {
            this.port.description = description;
        });

        this.form.controls["batchType"].valueChanges.subscribeTracked(this, (batchType) => {
            this.selectedBatchByOption = batchType;
            this.workflowModel.setBatch(this.port.id, batchType);
        });
    }

    labelUpdate(ev: FocusEvent) {
        const val = (<HTMLInputElement>ev.srcElement).value;

        if (val === this.port.label) {
            return;
        }

        this.port.label = val ? val : undefined;
        this.graph.draw();
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

    setDisabledState(isDisabled: boolean) {
        const excludedControls = ["batchType"];
        Object.keys(this.form.controls).filter(c => excludedControls.indexOf(c) === -1).forEach((item) => {
            const control = this.form.controls[item];
            isDisabled ? control.disable({emitEvent: false}) : control.enable({emitEvent: false});
        });
    }
}
