import {appTestDataReducer} from "./test-data.reducer";

export type AppTestData = {
    [inputID: string]: any
};
export type AppTestDataMap = { [appID: string]: AppTestData }

export interface ToolEditorState {
    appTestData: AppTestDataMap;
}

export const moduleStateRoot = "toolEditor";

export interface AppState {
    toolEditor: ToolEditorState
}

export const reducers = {
    appTestData: appTestDataReducer
};
