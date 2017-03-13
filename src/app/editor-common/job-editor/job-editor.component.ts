import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from "@angular/core";
import {ObjectHelper as OH} from "../../helpers/object.helper";
import {SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {EditorInspectorService} from "../inspector/editor-inspector.service";

/**
 * Job Editor modifies the test values of the job json.
 */
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-job-editor",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="row block mb-1">
            <div class="col-xs-12">
                <button class="btn btn-secondary pull-right"
                        (click)="reset.emit()">
                    Reset to mock values
                </button>
            </div>
        </div>


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

                            <label>{{ input?.label || input.id }} <i class="fa fa-info-circle text-muted"
                                                                     *ngIf="input.description"
                                                                     [ct-tooltip]="ctt"
                                                                     [tooltipPlacement]="'top'"></i>
                            </label>
                            <ct-job-editor-entry [prefix]="input.id"
                                                 [input]="input"
                                                 [value]="job.inputs[input.id]"
                                                 (update)="jobValueUpdate(input.id, $event)">
                            </ct-job-editor-entry>

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
    `
})
export class JobEditorComponent implements OnChanges {

    /**
     * Existing CWL job metadata.
     */
    @Input()
    public job: { allocatedResources?: { cpu: number, mem: number }, inputs?: {} } = {};

    /**
     * CWL app input definitions.
     */
    @Input()
    public inputs: SBDraft2CommandInputParameterModel[] = [];

    @Output()
    public update = new EventEmitter();

    @Output()
    public reset = new EventEmitter();

    constructor(private cdr: ChangeDetectorRef,
                private statusBar: StatusBarService,
                private inspector: EditorInspectorService) {
    }

    /**
     * Inputs grouped and sorted the way they should be presented.
     */
    public inputGroups: { name: string, inputs: SBDraft2CommandInputParameterModel[] }[] = [];

    /**
     * Executes when job values get edited in the top-level forms.
     * We need to take those values and emit the new job structure as an update.
     */
    private onJobFormChange(event: Event) {

        event.stopPropagation();

        console.log("----> Job Form Change", event);

        const formField = event.target as HTMLInputElement;

        // Make a copy of the current job so we can operate on it without modifying the shown data.
        const job = {...this.job};

        // Optional key of the optional nested property of the updated input's job value,
        // ex. "path" in "job.inputs.de_results.path".
        const jobPropPath = formField.getAttribute("jobPropPath");

        // Get field path (for an example -> "inputId.[0].record.[2]")
        const fieldPath = formField.getAttribute("prefix");

        // Get the new value that we should set the job to
        const val = formField.value;

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
        const jobRef = OH.getProperty(job.inputs, fieldPath);


        // Dispatch it as an update to the job
        this.jobValueUpdate(fieldPath, jobRef);
    }

    /**
     * Updates the job value for a given input and emits the updated job.
     */
    private jobValueUpdate(inputId, jobValue) {
        console.log("----> Job Value Update", inputId, jobValue);

        const input = this.inputs.find(i => i.id === inputId);

        // Show a message in the status bar about what's changed.
        this.statusBar.instant(`Updated job value of ${input ? input.label || input.id : inputId}.`);

        // Assign the given value to the job key
        OH.addProperty(this.job.inputs, inputId, jobValue);

        // Send the update to the output of this component
        this.update.emit(this.job);
        this.cdr.markForCheck();
    }

    /**
     * Update allocatedResources value
     */
    private onResourceFormChange(event: Event) {
        // Find which key was updated, either "mem" or "cpu"
        const formField = event.target as HTMLInputElement;
        const res = formField.name;
        const value = formField.value;

        // Update appropriate key, cast value to number
        OH.addProperty(this.job.allocatedResources, res, Number(value));

        // Send output for component
        this.update.emit(this.job);
        this.cdr.markForCheck();
    }

    ngOnChanges(changes: SimpleChanges) {
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
        this.inspector.hide();
    }

}
