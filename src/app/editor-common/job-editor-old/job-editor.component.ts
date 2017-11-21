import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {ObjectHelper as OH} from "../../helpers/object.helper";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {EditorInspectorService} from "../inspector/editor-inspector.service";

/**
 * Job Editor modifies the test values of the job json.
 * @deprecated use new job editor (with job-step-inspector-entry.component)
 */
@Component({
    styleUrls: ["job-editor.component.scss"],
    selector: "ct-job-editor-old",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel>
            <div class="tc-header">Computational Resources</div>
            <div class="tc-body">
                <form #resources="ngForm"
                      class="row"
                      (change)="onResourceFormChange($event)"
                      *ngIf="job.allocatedResources">
                    <div class="col-xs-6">
                        <label>CPU:</label>
                        <div class="form-group">
                            <input type="number" class="form-control" name="cpu"
                                   [ngModel]="job.allocatedResources.cpu">
                        </div>
                    </div>
                    <div class="col-xs-6">
                        <label>Mem:</label>
                        <div class="form-group">
                            <input type="number" class="form-control" name="mem"
                                   [ngModel]="job.allocatedResources.mem">
                        </div>
                    </div>
                </form>

            </div>
        </ct-form-panel>

        <div *ngFor="let group of inputGroups">

            <ct-form-panel>
                <div class="tc-header">{{ group.name }}</div>
                <div class="tc-body">
                    <form (change)="onJobFormChange($event)">
                        <div *ngFor="let input of group.inputs">

                            <label>{{ input?.label || input.id }} <i
                                class="fa fa-info-circle text-muted"
                                *ngIf="input.description"
                                [ct-tooltip]="ctt"
                                [tooltipPlacement]="'top'"></i>
                            </label>
                            <ct-job-editor-entry-old [prefix]="input.id"
                                                     [input]="input"
                                                     [value]="job.inputs[input.id]"
                                                     (update)="jobValueUpdate(input.id, $event)">
                            </ct-job-editor-entry-old>

                            <ct-tooltip-content #ctt>
                                <div class="tooltip-info">
                                    {{ input.description }}
                                </div>
                            </ct-tooltip-content>

                        </div>
                    </form>
                </div>
            </ct-form-panel>
        </div>

        <div class="block mb-1">
            <button class="btn btn-secondary pull-right" (click)="resetToMockValues()">
                Reset to mock values
            </button>
        </div>
    `
})
export class JobEditorOldComponent implements OnChanges, OnDestroy {

    /**
     * Existing CWL job metadata.
     */
    job: { allocatedResources?: { cpu: number, mem: number }, inputs?: {} } = {};

    @Input()
    model: CommandLineToolModel;

    /**
     * CWL app input definitions.
     */
    inputs: CommandInputParameterModel[] = [];

    @Output()
    update = new EventEmitter();

    @Output()
    reset = new EventEmitter();

    /**
     * Inputs grouped and sorted the way they should be presented.
     */
    inputGroups: { name: string, inputs: CommandInputParameterModel[] }[] = [];


    constructor(private cdr: ChangeDetectorRef,
                private statusBar: StatusBarService,
                private inspector: EditorInspectorService) {
    }

    /**
     * Executes when job values get edited in the top-level forms.
     * We need to take those values and emit the new job structure as an update.
     */
    onJobFormChange(event: Event) {

        event.stopPropagation();

        const formField = event.target as HTMLInputElement;

        // Make a copy of the current job so we can operate on it without modifying the shown data.
        const job = {...this.job};

        // Optional key of the optional nested property of the updated input's job value,
        // ex. "path" in "job.inputs.de_results.path".
        const jobPropPath = formField.getAttribute("jobPropPath");

        // Get field path (for an example -> "inputId.[0].record.[2]")
        const fieldPath = formField.getAttribute("prefix");

        // Get input type (number, text...)
        const type = formField.getAttribute("type");

        // Get field type (int, float, string, map ...)
        const fieldType = formField.getAttribute("fieldType");

        // Get field value
        const fieldValue = formField.value;

        // Get the new value that we should set the job to
        const val = type === "number" ?
            (fieldType === "int" ? parseInt(fieldValue, 10) : parseFloat(fieldValue))
            : fieldValue;

        // Form field might not have fieldPath, so if we missed it,
        // it's better to do nothing than break the app.
        if (!fieldPath) {
            return;
        }

        // Compose a path that looks like "inputs.de_results.[2].path",
        // where the last part is optional.
        const propPath = [
            "inputs",
            fieldPath,
            jobPropPath
        ].filter(v => v).join(".");

        // Assign the new value to the previously made new path.
        OH.addProperty(job, propPath, val);

        // Get the new value of this input's job.
        // On the previous step, we might have set some nested property of it,
        // so here we take the top-level structure anyway.
        const jobRef = OH.getProperty(job.inputs, fieldPath, null);


        // Dispatch it as an update to the job
        this.jobValueUpdate(fieldPath, jobRef);
    }

    /**
     * Updates the job value for a given input and emits the updated job.
     */
    jobValueUpdate(prefix, jobValue) {

        // Get top level id from prefix
        const inputId = prefix.split(".")[0];
        const input = this.inputs.find(i => i.id === inputId);

        // Show a message in the status bar about what's changed.
        this.statusBar.instant(`Updated job value of ${input ? input.label || input.id : inputId}.`);

        // If type is File, add class field to object
        if ((input.type.type === "File" ||
            input.type.type === "Directory") &&
            typeof jobValue === "object" &&
            jobValue !== null) {
            jobValue.class = input.type.type;
        }

        // Assign the given value to the job key
        OH.addProperty(this.job.inputs, prefix, jobValue);

        // Send the update to the output of this component
        this.update.emit(this.job);
        this.cdr.markForCheck();
    }

    /**
     * Update allocatedResources value
     */
    onResourceFormChange(event: Event) {
        // Find which key was updated, either "mem" or "cpu"
        const formField = event.target as HTMLInputElement;
        const res       = formField.name;
        const value     = formField.value;

        // Update appropriate key, cast value to number
        OH.addProperty(this.job.allocatedResources, res, Number(value));

        // Send output for component
        this.update.emit(this.job);
        this.cdr.markForCheck();
    }

    resetToMockValues() {
        if (this.inspector.inspectedObject.getValue() !== "revisions") {
            this.inspector.hide();
        }

        this.model.resetJobDefaults();
        this.recreateInputGroups();

        this.reset.emit();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.recreateInputGroups();
    }

    recreateInputGroups() {
        const context = this.model.getContext();

        this.job = context.$job || {
                inputs: context.inputs,
                allocatedResources: {
                    mem: context.runtime.ram,
                    cpu: context.runtime.cores
                }
            };

        this.inputs = this.model.inputs;

        // Whenever inputs are updated, regroup them and sort them for display
        const grouped = this.inputs.reduce((acc, item) => {
            const cat = OH.getProperty(item, "customProps.sbg:category", "Uncategorized");
            return Object.assign(acc, {[cat]: (acc[cat] || []).concat(item)});
        }, {});

        // Order groups alphabetically
        this.inputGroups = Object.keys(grouped).sort((a, b) => a.localeCompare(b)).map(key => ({
            name: key,
            inputs: grouped[key]
        }));
    }

    ngOnDestroy() {
        if (this.inspector.inspectedObject.getValue() !== "revisions") {
            this.inspector.hide();
        }
    }

}
