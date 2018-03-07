import {AppState, AppTestData} from "./index";

export function appTestData(appID: string): (state: AppState) => AppTestData {
    return (state: AppState) => {
        if(state && state.toolEditor && state.toolEditor.appTestData){
            return state.toolEditor.appTestData[appID];
        }
    }
}
