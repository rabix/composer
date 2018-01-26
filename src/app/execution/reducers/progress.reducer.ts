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
import {TAB_CLOSE, TabCloseAction} from "../../core/actions/core.actions";


function endUnfinishedStepTimes(stepStates: StepState[]): StepState[] {
    return stepStates.map(state => {
        if (!state.endTime) {
            state.endTime = Date.now();
        }

        if (!state.startTime) {
            state.startTime = Date.now();
        }

        return state;
    })
}

export function reducer(state: State = {}, action: { type: string }): State {

    switch (action.type) {

        case TAB_CLOSE: {
            const {tabID} = action as TabCloseAction;

            if (!state[tabID]) {
                return state;
            }

            const stateUpdate = {...state};
            delete stateUpdate[tabID];

            return stateUpdate;
        }

        /**
         * On start, set all steps to pending state
         */
        case EXECUTION_START: {

            const {steps, appID, outDirPath} = action as ExecutionStart;

            const stepProgress = steps.map(step => ({
                ...step,
                state: "pending" as StepStateType,
                startTime: null,
                endTime: null
            }));

            const appState = {
                state: "started",
                exitCode: undefined,
                outDirPath,
                stepProgress
            } as AppExecutionState;

            return {...state, [appID]: appState};

        }

        case EXECUTION_COMPLETE: {


            const {appID} = action as ExecutionComplete;


            let stepProgress = state[appID].stepProgress.slice() as StepState[];
            stepProgress     = stepProgress.map(stepState => ({...stepState, state: "completed" as StepStateType}));
            stepProgress     = endUnfinishedStepTimes(stepProgress);

            const appUpdate = {...state[appID], stepProgress, state: "completed"} as AppExecutionState;

            return {...state, [appID]: appUpdate};
        }

        case EXECUTION_ERROR: {

            const {appID, exitCode}     = action as ExecutionError;
            const transitions = new Map<StepStateType, StepStateType>([
                ["pending", "cancelled"],
                ["started", "terminated"]
            ]);
            let stepProgress  = state[appID].stepProgress.slice() as StepState[];

            stepProgress = stepProgress.map(stepState => {

                const state = transitions.get(stepState.state) || stepState.state;
                return {...stepState, state};
            });

            stepProgress = endUnfinishedStepTimes(stepProgress);

            const appUpdate = {...state[appID], stepProgress, state: "failed", exitCode} as AppExecutionState;

            return {...state, [appID]: appUpdate};
        }

        case EXECUTION_REQUIREMENT_ERROR: {
            const {appID, message} = action as ExecutionRequirementError;
            const appUpdate        = {
                ...state[appID],
                state: "failed",
                errorMessage: message,
                stepProgress: endUnfinishedStepTimes(state[appID].stepProgress)
            } as AppExecutionState;
            return {...state, [appID]: appUpdate};
        }

        case EXECUTION_STOP: {

            const {appID} = action as ExecutionError;

            let stepProgress = state[appID].stepProgress.slice() as StepState[];
            stepProgress     = stepProgress.map(stepState => ({...stepState, state: "cancelled" as StepStateType}));
            stepProgress     = endUnfinishedStepTimes(stepProgress);


            const appUpdate = {...state[appID], stepProgress, state: "stopped"} as AppExecutionState;

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
                    const item      = stepProgress[i];

                    if (item.state === "started") {
                        item.startTime = Date.now();
                    } else if (item.state === "completed" || item.state === "failed") {
                        item.endTime = Date.now();
                    }
                }

            }

            const appUpdate = {...state[appID], stepProgress};

            // Check if last line is a failure
            const lines = message.split("\n");

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
     *               |         |    capture whatever optionally follows, starting either a whitespace, dot, or a comma, discard that later
     *               |         |    |                then match the state that the executor flushes
     *               |         |    |                |
     *               ↓         ↓    ↓                ↓
     */
    const matcher = /Job root\.(.*?)(\s|,.*?|\..*?)?(has\scompleted|has\sstarted|failed)/i;
    const match   = content.match(matcher);

    if (match) {
        const [, stepID, rest, stateMatch] = match;


        let status = "failed";
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
