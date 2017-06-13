import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation} from "@angular/core";
import {Workflow} from "cwl-svg";
import {StepModel, WorkflowModel} from "cwlts/models";
import {PlatformAPI} from "../../../services/api/platforms/platform-api.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {PlatformAPIGatewayService} from "../../../auth/api/platform-api-gateway.service";
import {UpdateStepModalComponent} from "../../update-step-modal/update-step-modal.component";

@Component({
    selector: "ct-workflow-step-inspector",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./step-inspector.component.scss"],
    template: `

        <!--Update warning-->
        <div class="alert alert-warning form-control-label" *ngIf="step.hasUpdate">
            Update available.<a href="" (click)="updateStep($event)"> Click here to update.</a>
        </div>

        <!--View Modes-->
        <ct-action-bar class="row workflow-step-inspector-tabs">
            <ct-tab-selector class="full-width"
                             [distribute]="'equal'"
                             [active]="viewMode"
                             (activeChange)="changeTab($event)">

                <ct-tab-selector-entry [tabName]="tabs.Info">
                    <span>App Info</span>
                </ct-tab-selector-entry>

                <ct-tab-selector-entry [tabName]="tabs.Inputs">
                    <span>Inputs</span>
                </ct-tab-selector-entry>

                <ct-tab-selector-entry [tabName]="tabs.Step">
                    <span>Step</span>
                </ct-tab-selector-entry>
            </ct-tab-selector>
        </ct-action-bar>

        <!--Info-->
        <ct-workflow-step-inspector-inputs *ngIf="viewMode === tabs.Inputs"
                                           [step]="step"
                                           [inputs]="step.in"
                                           [graph]="graph"
                                           [workflowModel]="workflowModel">
        </ct-workflow-step-inspector-inputs>

        <!--Inputs-->
        <ct-workflow-step-inspector-info *ngIf="viewMode === tabs.Info"
                                         [step]="step">
        </ct-workflow-step-inspector-info>

        <!--Step-->
        <ct-workflow-step-inspector-step *ngIf="viewMode === tabs.Step"
                                         [step]="step"
                                         [graph]="graph"
                                         [workflowModel]="workflowModel">
        </ct-workflow-step-inspector-step>
    `
})
export class StepInspectorComponent extends DirectiveBase {

    @Input()
    step: StepModel;

    @Input()
    workflowModel: WorkflowModel;

    @Input()
    graph: Workflow;

    @Input()
    fileID:string;

    tabs = {
        Inputs: "inputs",
        Info: "info",
        Step: "step"
    };

    viewMode = this.tabs.Inputs;

    constructor(private modal: ModalService,
                private platform: PlatformAPI,
                private apiGateway: PlatformAPIGatewayService,
                private cdr: ChangeDetectorRef,
                private userPrefService: UserPreferencesService) {
        super();

        // @fixme Bring this back with the new service
        // this.tracked = this.userPrefService.get("step_inspector_active_tab", this.tabs.Inputs, true)
        //     .subscribe(x => this.viewMode = x);
    }


    updateStep(ev: Event) {
        ev.preventDefault();

        const appId   = this.step.run.customProps["sbg:id"].split("/");
        const appData = [appId[0], appId[1], appId[2]].join("/");

        console.log("Should update app", ev, this);

        const [appHash] = this.fileID.split("/");
        const api = this.apiGateway.forHash(appHash);

        api.getApp(appData).subscribe((app) => {

            const component = this.modal.fromComponent(UpdateStepModalComponent, {
                title: "Update available",
                closeOnOutsideClick: true,
                closeOnEscape: true
            });

            component.step         = this.step;
            component.updatedModel = app;

            component.confirm = () => {
                this.step.setRunProcess(app);
                this.step.hasUpdate = false;

                this.cdr.markForCheck();

                component.closeModal();
            };
        });
    }

    changeTab(tab: string) {
        this.viewMode = tab;
        this.userPrefService.put("step_inspector_active_tab", tab);
    }
}
