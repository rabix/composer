import {ActionReducerMap} from "@ngrx/store";
import * as progress from "./progress.reducer";


export interface State {
    [appID: string]: AppExecutionState
}

export interface AppExecutionState {
    errorMessage: string,
    outDirPath: string,
    commandLine: string,
    stepProgress: StepState[]
}


export interface StepState {
    id: string;
    label?: string;
    state: StepStateType;
}

export type StepStateType = "pending" | "started" | "failed" | "completed" | "terminated" | "cancelled";


export const reducers: ActionReducerMap<State> = {
    progress: progress.reducer as any,
};
