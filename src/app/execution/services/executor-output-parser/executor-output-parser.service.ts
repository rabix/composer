import {Injectable} from "@angular/core";
import {Actions, Effect} from "@ngrx/effects";
import {Observable} from "rxjs/Observable";
import {
    EXECUTOR_OUTPUT,
    ExecutorOutputAction,
    ExecutionStepFailedAction,
    ExecutionStepCompletedAction,
    ExecutionStepStartedAction,
    ExecutionDockerPullTimeoutAction
} from "../../actions/execution.actions";
import {Action} from "@ngrx/store";
import {ExecutionState} from "../../models";
import {extractStepProgress, extractDockerTimeout} from "./log-parser";
import {flatMap, map, filter} from "rxjs/operators";

@Injectable()
export class ExecutorOutputParser {

    @Effect()
    stepStates: Observable<Action>;

    @Effect()
    dockerPullFailure: Observable<Action>;

    constructor(private actions: Actions) {

        this.stepStates = this.actions.ofType<ExecutorOutputAction>(EXECUTOR_OUTPUT).pipe(
            flatMap(action => {
                const updates = extractStepProgress(action.message);
                const appID   = action.appID;
                const list    = [];

                updates.forEach((state, stepID) => list.push({appID, stepID, state}));

                if (list.length === 0) {
                    return Observable.empty();
                }

                return Observable.of(...list);
            }),
            flatMap(data => {
                const {appID, stepID, state} = data;

                switch (state as ExecutionState) {

                    case "failed":
                        return Observable.of(new ExecutionStepFailedAction(appID, stepID));

                    case "completed":
                        return Observable.of(new ExecutionStepCompletedAction(appID, stepID));

                    case "started":
                        return Observable.of(new ExecutionStepStartedAction(appID, stepID));

                    default:
                        return Observable.empty();
                }

            })
        );

        this.dockerPullFailure = this.actions.ofType<ExecutorOutputAction>(EXECUTOR_OUTPUT).pipe(
            map(action => ({appID: action.appID, timeout: extractDockerTimeout(action.message)})),
            filter(data => data.timeout !== undefined),
            map(data => new ExecutionDockerPullTimeoutAction(data.appID, Date.now() + data.timeout * 1000))
        );
    }
}
