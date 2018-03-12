import {Injectable} from "@angular/core";
import {Actions, Effect} from "@ngrx/effects";
import {Observable} from "rxjs/Observable";
import {
    ExecutorOutputAction,
    ExecutionStepFailedAction,
    ExecutionStepCompletedAction,
    ExecutionStepStartedAction,
    ExecutionDockerPullTimeoutAction, ExecutionErrorAction
} from "../../actions/execution.actions";
import {Action} from "@ngrx/store";
import {flatMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {empty} from "rxjs/observable/empty";
import {StepInfoLogEntry, DockerPullTryLogEntry, ComposerLogEntry} from "../../types";
import {ExecutionError} from "../../models";

@Injectable()
export class ExecutorOutputParser {

    @Effect()
    stepStates: Observable<Action>;

    constructor(private actions: Actions) {

        this.stepStates = this.actions.ofType<ExecutorOutputAction>(ExecutorOutputAction.type).pipe(
            flatMap((action: ExecutorOutputAction) => {
                const {appID, message} = action;

                const composerMark = "Composer: ";
                const lines        = message.split("\n");

                const composerLogs = lines.reduce((acc, line) => {

                    const composerMarkIndex = line.indexOf(composerMark);
                    if (composerMarkIndex === -1) {
                        return acc;
                    }

                    const composerMessage = line.substr(composerMarkIndex + composerMark.length);

                    try {
                        const data = JSON.parse(composerMessage) as ComposerLogEntry;
                        return acc.concat({appID, data});
                    } catch (ex) {
                        console.warn("Could not parse composer message", composerMessage);
                        return acc;
                    }

                }, []);
                return of(...composerLogs);

            }),
            flatMap(action => {
                const {data} = action;
                const appID  = action.appID;
                if (data.hasOwnProperty("stepId")) {
                    const {status, stepId, message} = data as StepInfoLogEntry;

                    const stepParts        = stepId.split(".");
                    const firstLevelStepID = stepParts[1];

                    if (!firstLevelStepID) {
                        if (status === "FAILED") {
                            return of(new ExecutionErrorAction(appID, new ExecutionError(undefined, message, "execution")));
                        }
                        return empty();
                    }

                    switch (status) {
                        case "COMPLETED":
                            return of(new ExecutionStepCompletedAction(appID, firstLevelStepID));
                        case "FAILED":
                            return of(new ExecutionStepFailedAction(appID, firstLevelStepID, message));
                        case "READY":
                            return of(new ExecutionStepStartedAction(appID, firstLevelStepID));
                    }
                } else if (data.status === "DOCKER_PULL_FAILED") {
                    const {retry} = data as DockerPullTryLogEntry;
                    return of(new ExecutionDockerPullTimeoutAction(appID, Date.now() + retry * 1000));
                }

                return empty();

            })
        );
    }
}
