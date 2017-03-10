import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {StepModel, WorkflowModel} from "cwlts/models";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {ModalService} from "../../../components/modal/modal.service";
import {PlatformAPI} from "../../../services/api/platforms/platform-api.service";
import {UpdateStepModal} from "../../../components/modal/custom/update-step-modal.component";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./step-inspector.component.scss"],
    template: `

        <!--Update warning-->
        <div class="alert alert-warning form-control-label" *ngIf="step.hasUpdate">
            Update available.<a href="" (click)="updateStep($event)"> Click here for update!</a>
        </div>

        <!--View Modes-->
        <div class="row workflow-step-inspector-tabs">

            <!--Tab Info-->
            <div class="single-tab col-sm-4" [class.active]="viewMode == tabs.Info" (click)="changeTab(tabs.Info)">
                <span>App Info</span>
            </div>

            <!--Tab Inputs-->
            <div class="single-tab col-sm-4" [class.active]="viewMode == tabs.Inputs" (click)="changeTab(tabs.Inputs)">
                <span>Inputs</span>
            </div>

            <!--Tab Step-->
            <div class="single-tab col-sm-4" [class.active]="viewMode == tabs.Step" (click)="changeTab(tabs.Step)">
                <span>Step</span>
            </div>

        </div>

        <!--Info-->
        <ct-workflow-step-inspector-inputs *ngIf="viewMode === tabs.Inputs"
                                           [step]="step"
                                           [inputs]="step.in"
                                           [workflowModel]="workflowModel">
        </ct-workflow-step-inspector-inputs>

        <!--Inputs-->
        <ct-workflow-step-inspector-info *ngIf="viewMode === tabs.Info"
                                         [step]="step">
        </ct-workflow-step-inspector-info>

        <!--Step-->
        <ct-workflow-step-inspector-step *ngIf="viewMode === tabs.Step"
                                         [step]="step"
                                         [workflowModel]="workflowModel">
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

    constructor(private userPrefService: UserPreferencesService, private modal: ModalService,
                private platform: PlatformAPI, private cdr: ChangeDetectorRef) {
        super();

        this.tracked = this.userPrefService.get("step_inspector_active_tab", this.tabs.Inputs, true)
            .subscribe(x => this.viewMode = x);
    }



    private updateStep(ev: Event) {
        ev.preventDefault();

        const appId = this.step.run.customProps['sbg:id'].split('/');
        const appData = [appId[0], appId[1], appId[2]].join("/");


        this.platform.getApp(appData).subscribe((app) => {

            const component = this.modal.show(UpdateStepModal, {
                title: "Update available",
                closeOnOutsideClick: true,
                closeOnEscape: true
            });

            component.step = this.step;
            component.updatedModel = app;

            component.confirm = () => {
                this.step.setRunProcess(app);
                this.step.hasUpdate = false;

                this.cdr.markForCheck();

                component.closeModal();
            }
        });
    }

    private changeTab(tab: string) {
        this.viewMode = tab;
        this.userPrefService.put("step_inspector_active_tab", tab);
    }
}
