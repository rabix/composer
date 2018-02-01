import {ActionReducerMap} from "@ngrx/store";
import * as progress from "./progress.reducer";
import {AppExecution} from "../models";
import {ProgressState} from "./";

export interface ModuleState {
    progress: ProgressState;
}

export interface ProgressState {
    [appID: string]: AppExecution;
}


export const reducers: ActionReducerMap<ProgressState> = {
    progress: progress.reducer as any,
};

export interface AppState {
    execution: ModuleState;
}
