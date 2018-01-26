import {ActionReducerMap} from "@ngrx/store";
import * as progress from "./progress.reducer";


export interface State {
    [appID: string]: AppExecutionState
}

export interface AppExecutionState {
    errorMessage?: string,
    outDirPath: string,
    state: "started" | "completed" | "failed" | "stopped",
    exitCode?: number
    stepProgress: StepState[]
}


export interface StepState {
    id: string;
    label?: string;
    state: StepStateType;
    startTime?: number;
    endTime?: number;
}

export type StepStateType = "pending" | "started" | "failed" | "completed" | "terminated" | "cancelled";


export const reducers: ActionReducerMap<State> = {
    progress: progress.reducer as any,
};
