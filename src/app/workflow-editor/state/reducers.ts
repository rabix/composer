import {StepUpdatesState, WorkflowEditorModuleState} from "./types";
import {Action, ActionReducerMap} from "@ngrx/store";
import {UpdateStepRevisionMapAction} from "./actions";
import {TabCloseAction} from "../../core/actions/core.actions";

/**
 * Reducer list for WorkflowEditorModule
 */
export const reducers: ActionReducerMap<WorkflowEditorModuleState> = {
    stepUpdates: stepUpdatesReducer
};

export function stepUpdatesReducer(state: StepUpdatesState = {}, action: Action) {

    switch (action.type) {
        case UpdateStepRevisionMapAction.type: {
            const {appID, revisionMap} = action as UpdateStepRevisionMapAction;
            return {...state, [appID]: revisionMap};
        }

        case TabCloseAction.type: {
            const {tabID} = action as TabCloseAction;
            if (state[tabID]) {
                const copy = {...state};
                delete copy[tabID];
                return copy;
            }

            return state;
        }
    }
    return state;
}
