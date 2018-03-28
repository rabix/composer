import {AppState} from "./types";

export function stepUpdateMap(appID: string): (AppState) => any {
    return (state: AppState) => {
        if (state && state.workflowEditor && state.workflowEditor.stepUpdates) {
            return state.workflowEditor.stepUpdates[appID] || {};
        }

        return {};
    }
}
