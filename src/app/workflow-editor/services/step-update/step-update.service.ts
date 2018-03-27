import {Injectable} from "@angular/core";
import {AuthService} from "../../../auth/auth.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {Actions, ofType, Effect} from "@ngrx/effects";
import {
    StepUpdateCheckRequestAction,
    UpdateStepRevisionMapAction,
    StepRevisionCheckStartAction,
    StepRevisionCheckCancelAction,
    StepRevisionCheckErrorAction
} from "../../state/actions";
import {switchMap, filter, map, catchError, take} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {StepModel} from "cwlts/models";
import {fromPromise} from "rxjs/observable/fromPromise";
import {empty} from "rxjs/observable/empty";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {Action} from "@ngrx/store";

@Injectable()
export class StepUpdateService {

    /**
     * Whevever an emit comes, we are eligible to check whether there are updates for a list of steps
     */
    @Effect()
    private updateCheckRequest: Observable<Action>;

    @Effect()
    private stepRevisionFetch: Observable<Action>;

    private appStatusMessages = new Map<string, string>();

    constructor(private auth: AuthService,
                private status: StatusBarService,
                private platformRepository: PlatformRepositoryService,
                private notifications: NotificationBarService,
                private actions: Actions) {

        this.updateCheckRequest = this.observeEligibleCheckRequests();

        this.stepRevisionFetch = this.actions.pipe(
            ofType<StepRevisionCheckStartAction>(StepRevisionCheckStartAction.type),
            switchMap(action => this.makeFetchActionTransformer(action.appID, action.stepIDs))
        );

        this.actions.pipe(ofType<StepRevisionCheckCancelAction | UpdateStepRevisionMapAction | StepRevisionCheckErrorAction>(
            StepRevisionCheckCancelAction.type, UpdateStepRevisionMapAction.type, StepRevisionCheckErrorAction.type
        )).subscribe(action => {
            this.closeStatusMessage(action.appID);
        });

        this.actions.pipe(ofType<StepRevisionCheckErrorAction>(StepRevisionCheckErrorAction.type)).subscribe(action => {
            this.status.instant("Failed to fetch step updates. ");
        });

        // Whenever we are going to check for updates, notification bar should say so
        this.actions.pipe(
            ofType<StepRevisionCheckStartAction>(StepRevisionCheckStartAction.type)
        ).subscribe(action => {
            this.showStatusMessage(action.appID, "Checking for app updates...");
        });

    }

    private makeFetchActionTransformer(appID: string, stepIDs: string[]): Observable<any> {
        return new Observable(observer => {
            const sub = fromPromise(this.platformRepository.getUpdates(stepIDs)).pipe(
                catchError(err => {
                    observer.next(new StepRevisionCheckErrorAction(appID, err));
                    return empty()
                }),
                map((updates: {
                    id: string;
                    name: string;
                    revision: number;
                }[]) => updates.reduce((acc, item) => {
                    const revisionlessID = AppHelper.getRevisionlessID(item.id);
                    return {...acc, [revisionlessID]: item.revision};
                }, {})),
                take(1)
            ).subscribe(revisionMap => {
                observer.next(new UpdateStepRevisionMapAction(appID, revisionMap));
            });

            return () => {
                sub.unsubscribe();
            }

        });
    }

    private showStatusMessage(appID: string, message: string) {
        this.closeStatusMessage(appID);
        const messageID = this.status.startProcess(message);
        this.appStatusMessages.set(appID, messageID);
    }

    private closeStatusMessage(appID: string) {
        if (this.appStatusMessages.has(appID)) {
            this.status.stopProcess(this.appStatusMessages.get(appID));
        }
    }

    /**
     * Listens to StepUpdateCheckRequestAction, and determines wheter step updates can be fetched based on
     * existence of an active user and number of steps
     */
    private observeEligibleCheckRequests(): Observable<StepRevisionCheckStartAction> {

        return this.actions.pipe(
            ofType<StepUpdateCheckRequestAction>(StepUpdateCheckRequestAction.type),
            switchMap(() => this.auth.getActive(), (action, credentials) => ({action, credentials})),
            filter(data => Boolean(data.credentials)),
            map(data => {
                const candidates = this.getUpdateCandidateAppIDs(data.action.steps);
                return new StepRevisionCheckStartAction(data.action.appID, candidates);
            }),
            filter(action => action.stepIDs.length !== 0)
        );

    }

    /**
     * Iterates over model steps and extracts IDs of contained steps
     * @returns Array of revisionless app IDs
     */
    private getUpdateCandidateAppIDs(steps: StepModel[]): string[] {
        return steps.reduce((acc, step) => {
            if (!step.run || !step.run.customProps || !step.run.customProps["sbg:id"]) {
                return acc;
            }

            return acc.concat(AppHelper.getAppIDWithRevision(step.run.customProps["sbg:id"], null));
        }, []);
    }

}
