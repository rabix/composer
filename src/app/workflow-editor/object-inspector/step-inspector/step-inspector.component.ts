import {ChangeDetectorRef, Component, Input} from "@angular/core";
import {Workflow} from "cwl-svg";
import {StepModel, WorkflowModel} from "cwlts/models";
import {RawApp} from "../../../../../electron/src/sbg-api-client/interfaces/raw-app";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {UpdateStepModalComponent} from "../../update-step-modal/update-step-modal.component";

@Component({
    selector: "ct-workflow-step-inspector",
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
                                           [workflowModel]="workflowModel"
                                           [readonly]="readonly">
        </ct-workflow-step-inspector-inputs>

        <!--Inputs-->
        <ct-workflow-step-inspector-info *ngIf="viewMode === tabs.Info"
                                         [step]="step">
        </ct-workflow-step-inspector-info>

        <!--Step-->
        <ct-workflow-step-inspector-step *ngIf="viewMode === tabs.Step"
                                         [step]="step"
                                         [graph]="graph"
                                         [workflowModel]="workflowModel"
                                         [readonly]="readonly">
        </ct-workflow-step-inspector-step>
    `
})
export class StepInspectorComponent extends DirectiveBase {

    @Input()
    readonly = false;

    @Input()
    step: StepModel;

    @Input()
    workflowModel: WorkflowModel;

    @Input()
    graph: Workflow;

    @Input()
    fileID: string;

    tabs = {
        Inputs: "inputs",
        Info: "info",
        Step: "step"
    };

    viewMode = this.tabs.Inputs;

    constructor(private modal: ModalService,
                private platformRepository: PlatformRepositoryService,
                private cdr: ChangeDetectorRef,
                private notificationBar: NotificationBarService,
                private statusBar: StatusBarService) {
        super();
    }


    updateStep(ev: Event) {
        ev.preventDefault();

        const appID = this.step.run.customProps["sbg:id"].split("/").slice(0, 3).join("/");
        const proc  = this.statusBar.startProcess("Updating " + appID);

        const modal = this.modal.fromComponent(UpdateStepModalComponent, {title: `Update ${appID}?`});
        modal.step  = this.step;

        this.platformRepository.getApp(appID).then((app: RawApp) => {
            this.statusBar.stopProcess(proc);
            modal.updatedApp = app;
            modal.isLoading  = false;
            modal.onSubmit   = () => {
                this.step.setRunProcess(app as any);
                this.step.hasUpdate = false;
                this.cdr.markForCheck();
                this.cdr.detectChanges();
                modal.closeModal();
            }
        }).catch(err => {
            modal.closeModal();
            this.statusBar.stopProcess(proc);
            this.notificationBar.showError(err.error ? err.error.message : err.message);
        });
    }

    changeTab(tab: string) {
        this.viewMode = tab;
    }
}
