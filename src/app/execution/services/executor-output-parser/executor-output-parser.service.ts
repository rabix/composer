import {Injectable} from "@angular/core";
import {Actions, Effect} from "@ngrx/effects";
import {Observable} from "rxjs/Observable";
import {
    EXECUTOR_OUTPUT,
    ExecutorOutputAction,
    ExecutionStepFailedAction,
    ExecutionStepCompletedAction,
    ExecutionStepStartedAction
} from "../../actions/execution.actions";
import {Action} from "@ngrx/store";
import {ExecutionState} from "../../models";
import {parseContent} from "./log-parser";

@Injectable()
export class ExecutorOutputParser {

    @Effect()
    output: Observable<Action>;

    constructor(private actions: Actions) {

        this.output = this.actions.ofType<ExecutorOutputAction>(EXECUTOR_OUTPUT)
            .flatMap(action => {
                const updates = parseContent(action.message);
                const appID   = action.appID;

                if (updates.has(undefined)) {
                    updates.set(appID, updates.get(undefined));
                    updates.delete(undefined);
                }

                const list = [];
                updates.forEach((state, stepID) => list.push({appID, stepID, state}));

                if (list.length === 0) {
                    return Observable.empty();
                }

                return Observable.of(...list);
            })
            .flatMap(data => {
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

            });
    }
}
