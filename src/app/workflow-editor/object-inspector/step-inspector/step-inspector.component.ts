import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {StepModel, WorkflowModel} from "cwlts/models";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./step-inspector.component.scss"],
    template: `
        <!--View Modes-->
        <div class="row workflow-step-inspector-tabs">

            <!--Tab Info-->
            <div class="single-tab col-sm-4" [class.active]="viewMode == tabs.Info" (click)="viewMode = tabs.Info">
                <span>App Info</span>
            </div>

            <!--Tab Inputs-->
            <div class="single-tab col-sm-4" [class.active]="viewMode == tabs.Inputs" (click)="viewMode = tabs.Inputs">
                <span>Inputs</span>
            </div>

            <!--Tab Step-->
            <div class="single-tab col-sm-4" [class.active]="viewMode == tabs.Step" (click)="viewMode = tabs.Step">
                <span>Step</span>
            </div>

        </div>

        <!--Info-->
        <ct-workflow-step-inspector-inputs *ngIf="viewMode === tabs.Inputs"
                                           [step]="step"
                                           [workflowModel]="workflowModel">
        </ct-workflow-step-inspector-inputs>

        <!--Inputs-->
        <ct-workflow-step-inspector-info *ngIf="viewMode === tabs.Info"
                                            [step]="step">
        </ct-workflow-step-inspector-info>

        <!--Step-->
        <ct-workflow-step-inspector-step *ngIf="viewMode === tabs.Step"
                                            [step]="step">
        </ct-workflow-step-inspector-step>
    `
})
export class WorkflowStepInspector extends ComponentBase {

    @Input()
    public step: StepModel;

    @Input()
    public workflowModel: WorkflowModel;

    private tabs = {
        Inputs: "inputs",
        Info: "info",
        Step: "step"
    };

    private viewMode = this.tabs.Inputs;

    constructor() {
        super();
    }
}
