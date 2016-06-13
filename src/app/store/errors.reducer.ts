import {Action, ActionReducer} from "@ngrx/store";
import * as ACTIONS from "./actions";

export interface IGlobalError {
    path?: string;
    error?: any;
}

//@todo(maya): write tests for error reducers, add standard error type
export const globalErrors: ActionReducer<IGlobalError> = (state: IGlobalError[], action: Action) => {

    switch(action.type) {
        case ACTIONS.FILE_CONTENT_ERROR:
            return Object.assign({}, state, action.payload);
        case ACTIONS.NEW_FILE_ERROR:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
    
};