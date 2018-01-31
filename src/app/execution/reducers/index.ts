import {ActionReducerMap} from "@ngrx/store";
import * as progress from "./progress.reducer";
import {AppExecution, StepExecution} from "../models";
import {ProgressState} from "./";

export interface ModuleState {
    progress: ProgressState
}

export interface ProgressState {
    [appID: string]: AppExecution
}


export const reducers: ActionReducerMap<ProgressState> = {
    progress: progress.reducer as any,
};

export interface AppState {
    execution: ModuleState
}

const state = {
    execution: {
        progress: {
            myApp: {
                outDir: "hello",
                state: "failed",
                stepExecution: [{

                    id: "step_id",
                    label: "My step id",
                    state: "completed"

                }] as Array<Partial<StepExecution>>
            } as Partial<AppExecution>
        }
    }
} as AppState;
