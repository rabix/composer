import {Component, Input, Output, ChangeDetectorRef, SimpleChanges, ChangeDetectionStrategy} from "@angular/core";
import {CommandInputParameterModel} from "cwlts/models/d2sb";
import {Subject} from "rxjs";
import {ComponentBase} from "../../../../components/common/component-base";
import {StepModel, WorkflowModel} from "cwlts/models";
import {ObjectHelper as OH} from "../../../../helpers/object.helper";
import {StatusBarService} from "../../../../core/status-bar/status-bar.service";

@Component({
    selector: "ct-workflow-step-inspector-inputs",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div *ngFor="let group of inputGroups">
        
            <ct-form-panel class="borderless">
                <div class="tc-header">{{ group.name }}</div>
                <div class="tc-body">
                    <form (change)="onInputsFormChange($event)">
                        <div *ngFor="let input of group.inputs; let i = index;">        
        
                            <!--Label and port options-->
                            <div class="form-group flex-container">                                
                                
                                <label>{{ input?.label || input.id }}: <i class="fa fa-info-circle text-muted"
                                                                          *ngIf="input.description"
                                                                          [ct-tooltip]="ctt"
                                                                          [tooltipPlacement]="'top'"></i>
                                </label>        
        
                                <!--Port options for File and array of Files-->
                                <span *ngIf="isFileType(input)" class="align-right"> 
                                            <ct-toggle-slider
                                                (change)="onPortOptionChange(input, $event ? 'port' : 'editable')"
                                                [value]="input.isVisible">
                                            </ct-toggle-slider>
                                 </span>        
                                
                                <!--Port options for all other types-->                                
                                <span *ngIf="!isFileType(input)" class="align-right">
                                            <ct-dropdown-button [dropDownOptions]="dropDownPortOptions" 
                                                                (change)="onPortOptionChange(input, $event)"
                                                                [value]="input.status">
                                            </ct-dropdown-button>
                                </span>        
                            </div>
        
                            <!--Input-->
                            <ct-workflow-step-inspector-entry [input]="input"
                                                              [prefix]="input.id"
                                                              [value]="input.default"
                                                              (update)="stepValueUpdate(input.id + '.default', $event)">
                            </ct-workflow-step-inspector-entry>        
        
                            <!--Connections-->
                            <div>
                                
                                <!--No connections-->
                                <div *ngIf="input.source.length === 0">
                                    <div class="alert alert-warning form-control-label">
                                        Not connected
                                    </div>
                                </div>

                                <!--List of connections-->
                                <div *ngIf="input.source.length > 0">
                                    Connections:
                                    <div *ngFor="let port of input.source">
                                        {{'PortId: ' + port}}
                                    </div>
                                </div>
                            </div>
        
                            <!--Tooltip-->
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
export class WorkflowStepInspectorTabInputs extends ComponentBase {

    private dropDownPortOptions = [
        {
            value: "editable",
            caption: "Editable",
            description: "Set port value"
        },
        {
            value: "exposed",
            caption: "Exposed",
            description: "Set port value on draft task page"
        },
        {
            value: "port",
            caption: "Port",
            description: "Connect the port with other ports"
        }
    ];

    @Input()
    public workflowModel: WorkflowModel;

    @Input()
    public step: StepModel;

    @Output()
    public save = new Subject<CommandInputParameterModel>();

    private group = [];

    public inputGroups: { name: string, inputs: CommandInputParameterModel[] }[] = [];

    constructor(private statusBar: StatusBarService) {
        super();
    }

    /**
     * Executes when port option get changed via drop down menu or toggle slider
     */
    private onPortOptionChange(input, value) {
        switch (value)
        {
            case'editable':
                this.workflowModel.clearPort(input);
                break;
            case'exposed':
                this.workflowModel.exposePort(input);
                break;
            case'port':
                this.workflowModel.includePort(input);
                break;
        }
    }

    /**
     * Executes when step get edited in the top-level forms.
     */
    private onInputsFormChange(event: Event) {

        event.stopPropagation();

        console.log("----> Step Inspector Form Change", event);

        const formField = event.target as HTMLInputElement;

        // Get field path (for an example -> "inputId.[0].record.[2]")
        const fieldPath = formField.getAttribute("prefix");

        // Get the new value that we should set input to
        const val = formField.value;

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
    private stepValueUpdate(prefix, value) {

        // Get top level id from prefix
        const inputId = prefix.split(".")[0];
        const input = this.step.in.find(i => i.id === inputId);

        console.log("----> Step Value Update", inputId, value);

        // Show a message in the status bar about what's changed.
        this.statusBar.instant(`Updated step value of ${input ? input.label || input.id : inputId}.`);

        // If input.default is undefined assign empty object to avoid breaking up addProperty function
        input.default = input.default || {};

        // Assign the given value to the step key
        OH.addProperty(this.step.inAsMap, prefix, value);
    }

    ngOnChanges(changes: SimpleChanges) {

        // Whenever inputs are updated, regroup them and sort them for display
        const grouped = this.step.in.reduce((acc, item) => {
            const group = this.isFileType(item) ? item.type.isNullable ? null : "Files" : "App parameters";
            return Object.assign(acc, group ? {[group]: (acc[group] || []).concat(item)} : null);

        }, {});

        // Order groups
        this.inputGroups = Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(key => ({
            name: key,
            inputs: grouped[key]
        }));
    }

    private isFileType(input) {
        return input.type.type === 'File' || (input.type.type === 'array' && input.type.items === 'File');
    }

}
