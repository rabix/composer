import {AppState} from "./index";
import {Optional} from "../utilities/types";
import {AppExecution} from "../models";

type AppSelectorType = (appID: string) => (state: AppState) => Optional<AppExecution>;

export const appSelector: AppSelectorType = (appID: string) => {

    return (state: AppState) => {

        if (!state || !state.execution || !state.execution.progress) {
            return;
        }

        return state.execution.progress[appID];
    };
};




