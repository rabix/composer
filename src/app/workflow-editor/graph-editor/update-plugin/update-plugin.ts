import {PluginBase, Workflow, StepNode} from "cwl-svg";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {Subscription} from "rxjs/Subscription";
import {StepModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";
import {switchMap, map, filter} from "rxjs/operators";
import {AuthService} from "../../../auth/auth.service";
import {fromPromise} from "rxjs/observable/fromPromise";

export class UpdatePlugin extends PluginBase {
    private css = {
        plugin: "__plugin-update",
        update: "__update-has-update"
    };

    private stepUpdateRequest = new Subject<any>();
    private subscriptions     = [] as Subscription[];
    private updateMap         = new Map<string, boolean>();

    private statusMessageID;

    constructor(private statusBar: StatusBarService,
                private auth: AuthService,
                private platformRepository: PlatformRepositoryService,
                private notificationBar: NotificationBarService) {
        super();

        const updateCheckIsDoable = this.stepUpdateRequest.pipe(
            switchMap(() => this.auth.getActive()),
            filter(activeCredentials => Boolean(activeCredentials))
        );

        const updateFlow = updateCheckIsDoable.pipe(
            map(() => this.getUpdateCandidateAppIDs()),
            switchMap(appIDs => fromPromise(this.platformRepository.getUpdates(appIDs))),
            map(updates => updates.reduce((acc, item) => {
                const revisionlessID = AppHelper.getRevisionlessID(item.id);
                return {...acc, [revisionlessID]: item.revision};
            }, {}))
        );

        const statusStart = updateCheckIsDoable.subscribe(() => {
            this.stopStatus();
            this.statusMessageID = this.statusBar.startProcess("Checking for app updates...")
        });

        const update = updateFlow.subscribe(appRevisionMap => {
            this.stopStatus();
            this.applyRevisionMap(appRevisionMap);
        }, err => {
            this.stopStatus();
            const errWrapper = new ErrorWrapper(err);
            if (!errWrapper.isOffline()) {
                this.notificationBar.showNotification("Cannot get app updates. " + errWrapper);
            }
        });

        this.subscriptions.push(update, statusStart);

    }

    registerWorkflow(workflow: Workflow) {
        super.registerWorkflow(workflow);
        this.workflow.svgRoot.classList.add(this.css.plugin);
    }

    afterModelChange() {
        this.stepUpdateRequest.next();
    }

    // noinspection JSUnusedGlobalSymbols
    enableEditing(enabled: boolean) {
        if (enabled) {
            this.stepUpdateRequest.next();
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

    destroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    private stopStatus() {
        if (this.statusMessageID) {
            this.statusBar.stopProcess(this.statusMessageID);
            this.statusMessageID = undefined;
        }
    }

    private applyRevisionMap(appRevisionMap: { [appID: string]: number }): void {
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
    }

    /**
     * Iterates over model steps and extracts IDs of contained steps
     * @returns Array of revisionless app IDs
     */
    private getUpdateCandidateAppIDs(): string[] {
        return this.workflow.model.steps.reduce((acc, step) => {
            if (!step.run || !step.run.customProps || !step.run.customProps["sbg:id"]) {
                return acc;
            }

            return acc.concat(AppHelper.getAppIDWithRevision(step.run.customProps["sbg:id"], null));
        }, []);
    }

    private findStep(step: StepModel): SVGElement {
        return this.workflow.svgRoot.querySelector(`.step[data-connection-id="${step.connectionId}"]`) as SVGElement;
    }
}
