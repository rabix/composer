import {PluginBase, Workflow, StepNode} from "cwl-svg";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {Observable} from "rxjs/Observable";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {Subscription} from "rxjs/Subscription";
import {StepModel} from "cwlts/models";

export class UpdatePlugin extends PluginBase {

    private css = {
        plugin: "__plugin-update",
        update: "__update-has-update"
    };

    private updateMap = new Map<string, boolean>();

    private subscription: Subscription;

    private updateStatusProcess;

    constructor(private statusBar: StatusBarService,
                private platformRepository: PlatformRepositoryService,
                private notificationBar: NotificationBarService) {
        super();
    }

    registerWorkflow(workflow: Workflow) {
        super.registerWorkflow(workflow);
        this.workflow.svgRoot.classList.add(this.css.plugin);
    }

    afterModelChange() {
        this.cleanUp();

        if (this.workflow.editingEnabled) {
            this.getStepUpdates();
        }
    }

    enableEditing(enabled: boolean) {
        if (enabled) {
            this.getStepUpdates();
        } else if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    hasUpdate(step: StepModel): boolean {
        return this.updateMap.get(step.connectionId);
    }

    updateStep(step: StepModel) {
        const stepEl = this.findStep(step);
        stepEl.classList.remove(this.css.update);
        this.updateMap.set(step.connectionId, false);
        new StepNode(stepEl, step as any).update();
    }

    private cleanUp() {
        if (this.updateStatusProcess) {
            this.statusBar.stopProcess(this.updateStatusProcess);
            this.updateStatusProcess = null;
        }

        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    private findStep(step: StepModel): SVGElement {
        return this.workflow.svgRoot.querySelector(`.step[data-connection-id="${step.connectionId}"]`) as SVGElement;
    }

    /**
     * Call updates service to get information about steps if they have updates and mark ones that can be updated
     */
    private getStepUpdates() {

        this.updateStatusProcess       = this.statusBar.startProcess("Checking for app updates…");
        const nestedAppRevisionlessIDs = this.workflow.model.steps
            .map(step => {
                if (!step.run || !step.run.customProps || !step.run.customProps["sbg:id"]) {
                    return;
                }

                return AppHelper.getAppIDWithRevision(step.run.customProps["sbg:id"], null);
            })
            .filter(v => v);

        // there is already a request for updates underway
        if (this.subscription) return;

        // We are wrapping a promise as a tracked observable so we easily dispose of it when component gets destroyed
        // If this gets destroyed while fetch is in progress, when it completes it will try to access the destroyed view
        // which results in throwing an exception
        this.subscription = Observable.fromPromise(this.platformRepository.getUpdates(nestedAppRevisionlessIDs))
            .finally(() => this.cleanUp())
            .subscribe(result => {

                const appRevisionMap = result.reduce((acc, item) => {

                    const revisionlessID = AppHelper.getRevisionlessID(item.id);
                    return {...acc, [revisionlessID]: item.revision};
                }, {});

                this.workflow.model.steps.forEach(step => {

                    // a non-sbg app might be embedded in an sbg workflow
                    if (!step.run || !step.run.customProps || !step.run.customProps["sbg:id"]) {
                        return;
                    }
                    const revisionless = AppHelper.getAppIDWithRevision(step.run.customProps["sbg:id"], null);
                    const revision     = AppHelper.getRevision(step.run.customProps["sbg:id"]);

                    if (appRevisionMap[revisionless] === undefined) {
                        return;
                    }

                    let hasUpdate = appRevisionMap[revisionless] > revision;
                    this.updateMap.set(step.connectionId, hasUpdate);

                    if (hasUpdate) {
                        const stepEl = this.findStep(step as any);
                        stepEl.classList.add(this.css.update);
                    }
                });

            }, err => {
                this.notificationBar.showNotification("Cannot get app updates. " + new ErrorWrapper(err));
                this.cleanUp();
            });
    }

    destroy() {
        this.cleanUp();
    }
}