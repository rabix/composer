import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from "@angular/core";
import {Workflow} from "cwl-svg";
import {StepModel, WorkflowModel} from "cwlts/models";
import {RawApp} from "../../../../../electron/src/sbg-api-client/interfaces/raw-app";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {UpdatePlugin} from "../../graph-editor/update-plugin/update-plugin";
import {UpdateStepModalComponent} from "../../update-step-modal/update-step-modal.component";

@Component({
    selector: "ct-workflow-step-inspector",
    styleUrls: ["./step-inspector.component.scss"],
    template: `

        <!--Update warning-->
        <div class="alert alert-update form-control-label" *ngIf="hasUpdate()">
            A new version of this app is available!
            <ng-container *ngIf="!readonly">
                <button class="btn-inline-link" (click)="updateStep($event)">Update</button>
                to get the latest changes.
            </ng-container>
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

        <!--Inputs-->
        <ct-step-inputs-inspector *ngIf="viewMode === tabs.Inputs"
                                  [step]="step"
                                  [stepIsUpdatedReference]="stepIsUpdatedReference"
                                  (change)="change.emit()"
                                  [workflowModel]="workflowModel"
                                  [readonly]="readonly">
        </ct-step-inputs-inspector>

        <!--Info-->
        <ct-workflow-step-inspector-info *ngIf="viewMode === tabs.Info"
                                         [step]="step">
        </ct-workflow-step-inspector-info>

        <!--Step-->
        <ct-workflow-step-inspector-step *ngIf="viewMode === tabs.Step"                                        
                                         [step]="step"
                                         [graph]="graph"
                                         [workflowModel]="workflowModel"
                                         (change)="change.emit()"
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

    @Output()
    change = new EventEmitter();

    /** Changing this reference will notify StepInputsInspectorComponent to update its inputs when step is updated */
    stepIsUpdatedReference = {};

    tabs = {
        Inputs: "inputs",
        Info: "info",
        Step: "step"
    };

    viewMode = this.tabs.Inputs;

    constructor(private modal: ModalService,
                private platformRepository: PlatformRepositoryService,
                private notificationBar: NotificationBarService,
                private statusBar: StatusBarService,
                private cdr: ChangeDetectorRef) {
        super();
    }


    updateStep(ev: Event) {
        ev.preventDefault();

        const appID = AppHelper.getAppIDWithRevision(this.step.run.customProps["sbg:id"], null);
        const proc  = this.statusBar.startProcess("Updating " + appID);

        const modal = this.modal.fromComponent(UpdateStepModalComponent, {title: `Update ${appID}?`});
        modal.step  = this.step;

        this.platformRepository.getApp(appID, true).then((app: RawApp) => {
            this.statusBar.stopProcess(proc);
            modal.updatedApp = app;
            modal.isLoading  = false;
            modal.onSubmit   = () => {
                this.step.setRunProcess(app as any);
                this.graph.getPlugin(UpdatePlugin).updateStep(this.step);
                // Change reference in order to call ngOnChanges in StepInputsInspectorComponent to recreate inputs
                this.stepIsUpdatedReference = {};
                this.cdr.detectChanges();
                this.cdr.markForCheck();
                modal.closeModal();
            };
        }).catch(err => {
            modal.closeModal();
            this.statusBar.stopProcess(proc);
            this.notificationBar.showNotification(new ErrorWrapper(err).toString());
        });
    }

    changeTab(tab: string) {
        this.viewMode = tab;
    }

    hasUpdate(): boolean {
        return this.graph.getPlugin(UpdatePlugin).hasUpdate(this.step);
    }
}
