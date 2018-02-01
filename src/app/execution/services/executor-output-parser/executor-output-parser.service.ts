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

@Injectable()
export class ExecutorOutputParser {


    @Effect()
    output: Observable<Action>;

    constructor(private actions: Actions) {

        this.output = this.actions.ofType(EXECUTOR_OUTPUT)
            .flatMap((action: ExecutorOutputAction) => {
                const updates = this.mapOutputToStepStates(action.message);

                const list = Object.keys(updates).reduce((acc, id) => acc.concat({
                    appID: action.appID,
                    stepID: id,
                    state: updates[id]
                }), []);

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


    private mapOutputToStepStates(text: string): { [stepID: string]: ExecutionState } {

        const lines = text.split("\n");
        const state = {};

        for (let i = 0; i < lines.length; i++) {
            const line   = lines[i];
            const parsed = this.parseExecutorOutput(line);

            if (!parsed) {
                continue;
            }

            const {stepID, status} = parsed;
            state[stepID]          = status;
        }

        return state;

    }

    private parseExecutorOutput(content: string): { stepID: string, status: ExecutionState } {

        /**
         *               Has something that contains “Job root.
         *               |
         *               |         then match the word after the dot, which is a step ID
         *               |         |
         *               |         |    capture whatever optionally follows, then discard captured value
         *               |         |    |- whitespace (in “root.compile has started”)
         *               |         |    |- dot (in “root.compile.subStep has started”)
         *               |         |    |- comma (in “root.compile, job id 32454 has failed”)
         *               |         |    |
         *               |         |    |                then match the state that the executor flushes
         *               |         |    |                |
         *               ↓         ↓    ↓                ↓
         */
        const matcher = /Job root\.(.*?)(\s|,.*?|\..*?)?(has\scompleted|has\sstarted|failed)/i;
        const match   = content.match(matcher);

        if (match) {
            const [, stepID, rest, stateMatch] = match;

            let status: ExecutionState = "failed";

            if (stateMatch === "has completed") {

                // FIXME: Might match completion status for a sub-step, which we should ignore, needs better communication with bunny
                if (rest.startsWith(".")) {
                    return;
                }

                status = "completed";
            } else if (stateMatch === "has started") {
                status = "started";
            }

            return {stepID, status};
        }
    }

}
