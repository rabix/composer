import {ActionReducer, Action} from "@ngrx/store";
import {FileModel} from "./models/fs.models";
import * as ACTIONS from "./actions";


export const fileContent: ActionReducer<FileModel> = (state: FileModel, action: Action) => {

    switch(action.type) {
        case ACTIONS.UPDATE_FILE_CONTENT:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
};