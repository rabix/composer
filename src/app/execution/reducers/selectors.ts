import {AppState} from "./index";

export const appSelector = (appID: string) => {

    return (state: AppState) => {
        if (!state || !state.execution || !state.execution.progress) {
            return {};
        }

        return state.execution.progress[appID] || {};
    };
};




