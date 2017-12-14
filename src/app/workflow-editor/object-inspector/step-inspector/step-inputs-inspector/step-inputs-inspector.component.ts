import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output
} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {StepModel, WorkflowModel, WorkflowStepInputModel} from "cwlts/models";
import {ObjectHelper as OH} from "../../../../helpers/object.helper";
import {StatusBarService} from "../../../../layout/status-bar/status-bar.service";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-step-inputs-inspector",
    styleUrls: ["./step-inputs-inspector.component.scss"],
    template: `
        <div *ngFor="let group of inputGroups">

            <ct-form-panel class="borderless">

                <div class="tc-header">{{ group.name }}</div>

                <div class="tc-body">
                    <form (change)="onInputsFormChange($event)">

                        <div *ngFor="let input of group.inputs" class="input-box">

                            <!--Label and port options-->
                            <div class="input-title flex-baseline">

                                <label class="input-label" title="{{ input.label || input.id }}">

                                    <span *ngIf="!input.type.isNullable" class="text-danger">*</span>

                                    <i class="fa fa-info-circle text-muted"
                                       *ngIf="hasMetadata(input)"
                                       [ct-tooltip]="ctt"
                                       [tooltipPlacement]="'bottom'"></i>
                                    {{ input.label || input.id }}

                                </label>

                                <!--Port options for File and array of Files-->
                                <div *ngIf="isType(input, ['File', 'Directory'])" class="port-controls">

                                    <ct-toggle-slider
                                        (valueChange)="onPortOptionChange(input, $event ? 'port' : 'default')"
                                        *ngIf="input.type.isNullable"
                                        [disabled]="readonly"
                                        on="Show"
                                        off="Hide"
                                        [value]="input.isVisible">
                                    </ct-toggle-slider>

                                </div>

                                <!--Port options for all other types-->
                                <div *ngIf="!isType(input, ['File', 'Directory'])" class="input-control">

                                    <ct-generic-dropdown-menu [ct-menu]="menu" menuAlign="left"
                                                              #portChangeDropDown>
                                        <button type="button" [disabled]="readonly" class="btn btn-unstyled" 
                                                (click)="portChangeDropDown.toggleMenu()">
                                            <span>
                                                {{ input.status }} <i
                                                class="fa fa-chevron-down fa-fw settings-icon"></i>
                                            </span>
                                        </button>

                                    </ct-generic-dropdown-menu>

                                    <ng-template #menu class="mr-1">
                                        <ul class="list-unstyled" (click)="portChangeDropDown.hide()">
                                            <li *ngFor="let c of dropDownPortOptions"
                                                [class.active]="input.status === c.value"
                                                (click)="onPortOptionChange(input, c.value)"
                                                class="dropdown-port-option">
                                                <span>
                                                    {{ c.caption }}
                                                </span>
                                                <span class="text-muted d-block small">{{ c.description }}</span>
                                            </li>
                                        </ul>
                                    </ng-template>

                                </div>
                            </div>

                            <!--Input-->
                            <ct-workflow-step-inspector-entry [input]="input"
                                                              [prefix]="input.id"
                                                              [value]="input.default"
                                                              [type]="input.type"
                                                              [readonly]="readonly"
                                                              *ngIf="!isType(input, 'File')"
                                                              (update)="stepValueUpdate(input.id + '.default', $event)"
                                                              class="mb-0">
                            </ct-workflow-step-inspector-entry>

                            <!--Connections-->
                            <div>

                                <!--No connections-->
                                <div *ngIf="input.source.length === 0 && input.isVisible">
                            <span class="text-warning" *ngIf="input.type.isNullable">
                                <i class="fa fa-warning fa-fw"></i> This port is not connected
                            </span>

                                    <span class="text-danger" *ngIf="!input.type.isNullable">
                                <i class="fa fa-times-circle fa-fw"></i> This required port is not connected
                            </span>
                                </div>

                                <!--List of connections-->
                                <div *ngIf="input.source.length > 0" class="text-muted">
                                    Connections: {{ input.source.join(", ") }}
                                </div>
                            </div>

                            <!--Tooltip-->
                            <ct-tooltip-content [maxWidth]="500" #ctt>

                                <h4>{{input.label || input.id}}</h4>

                                <!--Description-->
                                <div *ngIf="input.description" class="value">
                               
                                        {{input.description}}
                               
                                </div>
    <div *ngIf="input.customProps['sbg:toolDefaultValue']">                                    <span class="title">
                                            Suggested Value:
                                        </span>
                                    <span class="valueindent">
                                            {{input.customProps["sbg:toolDefaultValue"]}}
                                    </span>
                                </div>


                                <div *ngIf="input.fileTypes?.length">
                                    <span class="title">
                                        Suggested File Types:
                                    </span>
                                    <span class="value indent">
                                        {{(input.fileTypes || []).join(",")}}
                                    </span>
                                </div>
                                
                                <div *ngIf="input.customProps['sbg:altPrefix']">
                                    <span class="title">
                                        Alternative Command Line Prefix:
                                    </span>
                                        <span class="value indent">
                                        {{input.customProps["sbg:altPrefix"]}}
                                        </span>
                                </div>
                                
                            </ct-tooltip-content>

                        </div>
                    </form>
                </div>
            </ct-form-panel>
        </div>

    `
})
export class StepInputsInspectorComponent extends DirectiveBase implements OnInit, OnChanges {

    @Input()
    readonly = false;

    @Input()
    workflowModel: WorkflowModel;

    @Input()
    step: StepModel;

    @Output()
    change = new EventEmitter();


    dropDownPortOptions = [
        {
            value: "default",
            caption: "Default",
            description: "Set default value for execution"
        },
        {
            value: "exposed",
            caption: "Exposed",
            description: "Set value with the option to edit on the test page"
        },
        {
            value: "port",
            caption: "Port",
            description: "Get value from another node on the canvas"
        }
    ];

    group = [];

    inputGroups: { name: string, inputs: WorkflowStepInputModel[] }[] = [];

    constructor(private statusBar: StatusBarService, private cdr: ChangeDetectorRef) {
        super();
    }

    /**
     * Executes when port option get changed via drop down menu or toggle slider
     */
    onPortOptionChange(input, value) {
        switch (value) {
            case "default":
                this.workflowModel.clearPort(input);
                break;
            case "exposed":
                this.workflowModel.exposePort(input);
                break;
            case "port":
                this.workflowModel.includePort(input);
                break;
        }
    }

    /**
     * Executes when step get edited in the top-level forms.
     */
    onInputsFormChange(event: Event) {

        event.stopPropagation();

        const formField = event.target as HTMLInputElement;

        // Get field path (for an example -> "inputId.[0].record.[2]")
        const fieldPath = formField.getAttribute("prefix");

        // Get input type (number, text...)
        const type = formField.getAttribute("type");

        // Get field type (int, float, string, map ...)
        const fieldType = formField.getAttribute("fieldType");

        // Get field value
        const fieldValue = formField.value;

        // Get the new value that we should set the job to
        let val: any = fieldValue;

        if (type === "number" && !isNaN(parseInt(fieldValue, 10))) {
            val = fieldType === "int" ? parseInt(fieldValue, 10) : parseFloat(fieldValue);
        }

        // Nullify values that shouldn't be serialized
        val = (val !== "" && val !== undefined) ? val : null;

        // Form field might not have prefix, so if we missed it,
        // it's better to do nothing than break the app.
        if (!fieldPath) {
            return;
        }

        // Put "default" in prefix (inputId.[0].record.[2] -> inputId.default.[0].record.[2])
        const prefixSplit = fieldPath.split(".");
        prefixSplit.splice(1, 0, "default");
        const newPrefix = prefixSplit.join(".");

        // Dispatch it as an update to the step
        this.stepValueUpdate(newPrefix, val);
    }

    /**
     * Updates the step value for a given input
     */
    stepValueUpdate(prefix, value) {

        // Get top level id from prefix
        const inputId = prefix.split(".")[0];
        const input   = this.step.in.find(i => i.id === inputId);

        // Show a message in the status bar about what's changed.
        this.statusBar.instant(`Updated step value of ${input ? input.label || input.id : inputId}.`);

        // If input.default is undefined assign empty object to avoid breaking up addProperty function
        input.default = input.default || {};

        // Assign the given value to the step key
        OH.addProperty(this.step.inAsMap, prefix, value);
        this.change.emit();
    }

    ngOnInit() {
        this.tracked = this.workflowModel.on("connection.create", (src, dst) => this.onConnectionChange(src, dst));
        this.tracked = this.workflowModel.on("connection.remove", (src, dst) => this.onConnectionChange(src, dst));
    }

    ngOnChanges() {

        // Whenever inputs are updated, regroup them and sort them for display
        const grouped    = this.step.in.reduce((acc, item) => {
            const group = this.isType(item, "File") ? "Files" : "App parameters";
            return Object.assign(acc, group ? {[group]: (acc[group] || []).concat(item)} : null);

        }, {});

        // Order groups
        this.inputGroups = Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(key => ({
            name: key,
            inputs: grouped[key]
        }));
    }

    isType(input: WorkflowStepInputModel, types: string | string[]): boolean {
        if (typeof types === "string") {
            types = [types];
        }

        return !!types.find(type => {
            return input.type.type === type || input.type.items === type;
        });
    }

    private onConnectionChange(src, dest) {
        if (dest && dest.parentStep && dest.parentStep.id === this.step.id) {
            this.cdr.markForCheck();
        }
    };

    hasMetadata(input: WorkflowStepInputModel): boolean {
        return input.description || input.fileTypes.length || input.customProps["sbg:toolDefaultValue"] || input.customProps["sbg:altPrefix"];
    }
}
