import {
    EXECUTOR_OUTPUT,
    EXECUTION_START,
    ExecutionStart,
    ExecutorOutput,
    EXECUTION_COMPLETE,
    ExecutionComplete,
    EXECUTION_ERROR,
    ExecutionError,
    EXECUTION_STOP,
    EXECUTION_REQUIREMENT_ERROR,
    ExecutionRequirementError
} from "../actions/execution.actions";
import {State, StepState, StepStateType, AppExecutionState} from "./index";


export function reducer(state: State = {}, action: { type: string }): State {

    switch (action.type) {

        /**
         * On start, set all steps to pending state
         */
        case EXECUTION_START: {

            const {steps, appID, outDirPath} = action as ExecutionStart;

            const stepProgress = steps.map(step => ({
                ...step,
                state: "pending" as StepStateType
            }));

            const appState = {
                outDirPath,
                stepProgress
            } as AppExecutionState;

            return {...state, [appID]: appState};

        }

        case EXECUTION_COMPLETE: {


            const {appID} = action as ExecutionComplete;


            const stepProgressCast = state[appID].stepProgress.slice() as StepState[];
            const stepProgress     = stepProgressCast.map(stepState => {
                return {...stepState, state: "completed" as StepStateType};
            });

            const appUpdate = {...state[appID], stepProgress};

            return {...state, [appID]: appUpdate};
        }

        case EXECUTION_ERROR: {

            const {appID}          = action as ExecutionError;
            const stepProgressCast = state[appID].stepProgress.slice() as StepState[];
            const stepProgress     = stepProgressCast.map(stepState => {
                const transitions = new Map<StepStateType, StepStateType>([
                    ["pending", "cancelled"],
                    ["started", "terminated"]
                ]);

                const state = transitions.get(stepState.state) || stepState.state;

                return {...stepState, state};
            });

            const appUpdate = {...state[appID], stepProgress};

            return {...state, [appID]: appUpdate};
        }

        case EXECUTION_REQUIREMENT_ERROR: {
            const {appID, message} = action as ExecutionRequirementError;
            const appUpdate        = {...state[appID], errorMessage: message};
            return {...state, [appID]: appUpdate};
        }

        case EXECUTION_STOP: {

            const {appID} = action as ExecutionError;

            const stepProgressCast = state[appID].stepProgress.slice() as StepState[];
            const stepProgress     = stepProgressCast.map(stepState => ({...stepState, state: "cancelled" as StepStateType}));


            const appUpdate = {...state[appID], stepProgress};
            return {...state, [appID]: appUpdate};
        }

        /**
         * On executor output, try to match output lines to progress states,
         * then update steps
         */
        case EXECUTOR_OUTPUT: {


            const {appID, message} = action as ExecutorOutput;

            const stepProgress = state[appID].stepProgress.slice() as StepState[];


            const stateUpdates = mapOutputToStepStates(message);

            // If message parsing didn't find updates, just return original state without creating a new ref
            if (Object.keys(stateUpdates).length === 0) {
                return state;
            }

            const updatedStepIDs = Object.keys(stateUpdates);
            const hasFailure     = ~updatedStepIDs.map(key => stateUpdates[key]).indexOf("failed");

            for (let i = 0; i < stepProgress.length; i++) {

                const stepState     = stepProgress[i];
                const stepID        = stepState.id;
                const thisOneFailed = stateUpdates[stepID] === "failed";

                // Failure on any step terminates execution, so that should transition states of other steps
                if (hasFailure && !thisOneFailed) {

                    if (stepState.state === "started") {
                        stepProgress[i] = {...stepState, state: "terminated"};
                    } else if (stepState.state === "pending") {
                        stepProgress[i] = {...stepState, state: "cancelled"};
                    }

                    continue;
                }


                const hasProgress = stateUpdates.hasOwnProperty(stepID);
                const isDifferent = stepState.state !== stateUpdates[stepID];

                if (hasProgress && isDifferent) {
                    stepProgress[i] = {...stepState, state: stateUpdates[stepID]};
                }
            }

            const appUpdate = {...state[appID], stepProgress};

            return {...state, [appID]: appUpdate};
        }
    }

    return state;

}

function mapOutputToStepStates(text: string): { [stepID: string]: StepStateType } {

    const lines = text.split("\n");
    const state = {};

    for (let i = 0; i < lines.length; i++) {
        const line   = lines[i];
        const parsed = parseExecutorOutput(line);

        if (!parsed) {
            continue;
        }

        const {stepID, status} = parsed;
        state[stepID]          = status;
    }

    return state;

}

function parseExecutorOutput(content: string) {

    /**
     *               Has something that contains “Job root.
     *               |         then match the word after the dot, which is a step ID
     *               |         |    capture whatever optionally follows, starting either a whitespace or a comma, discard that later
     *               |         |    |         then match the state that the executor flushes
     *               |         |    |         |
     *               ↓         ↓    ↓         ↓
     */
    const matcher = /Job root\.(.*?)(\s|,.*?)?(has\scompleted|has\sstarted|failed)/i;
    const match   = content.match(matcher);

    if (match) {
        const [, stepID, , stateMatch] = match;

        let status = "failed";
        if (stateMatch === "has completed") {
            status = "completed";
        } else if (stateMatch === "has started") {
            status = "started";
        }

        return {stepID, status};
    }
}
