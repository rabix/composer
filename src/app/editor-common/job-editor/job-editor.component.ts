import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from "@angular/core";
import {ObjectHelper as OH} from "../../helpers/object.helper";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {StatusBarService} from "../../core/status-bar/status-bar.service";
import {EditorInspectorService} from "../inspector/editor-inspector.service";

/**
 * Job Editor modifies the test values of the job json.
 */
@Component({
    selector: "ct-job-editor",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div *ngFor="let group of inputGroups">
            <ct-form-panel>
                <div class="tc-header">{{ group.name }}</div>
                <div class="tc-body">
                    <form (change)="onJobFormChange($event)">
                        <div *ngFor="let input of group.inputs">

                            <label>{{ input?.label || input.id }}:</label>
                            <ct-job-editor-entry [input]="input"
                                                 [value]="job.inputs[input.id]"
                                                 (update)="jobValueUpdate(input.id, $event)">
                            </ct-job-editor-entry>
                            <div class="form-control-label">{{ input.description }}</div>

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
    public inputs: CommandInputParameterModel[] = [];

    @Output()
    public update = new EventEmitter();

    constructor(private cdr: ChangeDetectorRef,
                private statusBar: StatusBarService,
                private inspector: EditorInspectorService) {
    }

    /**
     * Inputs grouped and sorted the way they should be presented.
     */
    public inputGroups: { name: string, inputs: CommandInputParameterModel[] }[] = [];

    /**
     * Executes when job values get edited in the top-level forms.
     * We need to take those values and emit the new job structure as an update.
     */
    private onJobFormChange(event: Event) {
        console.log("----> Job Form Change", event);

        const formField = event.target as HTMLInputElement;

        // Make a copy of the current job so we can operate on it without modifying the shown data.
        const job = {...this.job};

        // Optional key of the optional nested property of the updated input's job value,
        // ex. "path" in "job.inputs.de_results.path".
        const jobPropPath = formField.getAttribute("jobPropPath");

        // If the input is an array, we should find the index of the element here.
        const arrayIndex = formField.getAttribute("arrayIndex") === null ? -1 : formField.getAttribute("arrayIndex");

        // If we have a record, nested inputs have a prefix property
        const prefix = formField.getAttribute("prefix");

        // ID of the input that the modification refers to.
        const inputId = prefix || formField.getAttribute("inputID");

        // Get the new value that we should set the job to
        const val = formField.value;

        // Form field might not have input id, so if we missed it,
        // it's better to do nothing than break the app.
        if (!inputId) {
            return;
        }

        // For ease of use, non-arrays will have -1 as an index value.
        const isArr = arrayIndex != -1;

        // Compose a path that looks like "inputs.de_results.[2].path",
        // where the last 2 parts are optional.
        const propPath = [
            "inputs",
            inputId,
            !isArr ? "" : `[${arrayIndex}]`,
            jobPropPath
        ].filter(v => v).join(".");

        // Assign the new value to the previously made new path.
        OH.addProperty(job, propPath, val);

        // Get the new value of this input's job.
        // On the previous step, we might have set some nested property of it,
        // so here we take the top-level structure anyway.
        const jobRef = OH.getProperty(job.inputs, inputId);


        // Dispatch it as an update to the job
        this.jobValueUpdate(inputId, jobRef);
    }

    /**
     * Updates the job value for a given input and emits the updated job.
     */
    private jobValueUpdate(inputId, jobValue) {
        console.log("----> Job Value Update", inputId, jobValue);

        const input = this.inputs.find(i => i.id === inputId);

        // Show a message in the status bar about what's changed.
        this.statusBar.instant(`Updated job value of ${input ? input.label || input.id : inputId}.`);

        // Create a new reference of the job for the change detector
        const job = {...this.job};

        // Assign the given value to the job key
        OH.addProperty(job.inputs, inputId, jobValue);

        // Send the update to the output of this component
        this.update.emit(job);
        this.job = {...job};
        this.cdr.markForCheck();
    }

    ngOnChanges(changes: SimpleChanges) {
        // Whenever inputs are updated, regroup them and sort them for display
        const grouped = this.inputs.reduce((acc, item) => {
            const cat = OH.getProperty(item, "customProps.sbg:category", "Uncategorized");
            return {...acc, ...{[cat]: (acc[cat] || []).concat(item)}};
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
