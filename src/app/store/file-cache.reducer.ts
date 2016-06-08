import {ActionReducer, Action} from "@ngrx/store";
import {FileModel} from "./models/fs.models";
import * as ACTIONS from "./actions";

interface IFileResponse {
    path: string;
    model: FileModel;
}

export const fileContent: ActionReducer<IFileResponse> = (state: IFileResponse, action: Action) => {

    switch(action.type) {
        case ACTIONS.UPDATE_FILE_CONTENT:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
};

export const newFile: ActionReducer<IFileResponse> = (state: IFileResponse, action: Action) => {

    switch(action.type) {
        case ACTIONS.NEW_FILE_CREATED:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }

};