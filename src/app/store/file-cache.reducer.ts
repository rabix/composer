import {ActionReducer, Action} from "@ngrx/store";
import {FileModel} from "./models/fs.models";
import * as ACTIONS from "./actions";

interface IFileContentResponse {
    path: string;
    model: FileModel;
}

export const fileContent: ActionReducer<IFileContentResponse> = (state: IFileContentResponse, action: Action) => {

    switch(action.type) {
        case ACTIONS.UPDATE_FILE_CONTENT:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
};