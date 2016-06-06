import {ActionReducer, Action} from "@ngrx/store";
import {FileModel} from "./models/fs.models";
import * as STORE_ACTIONS from "./actions";

export const openFiles: ActionReducer = (state: Array<FileModel> = [], action: Action) => {

    switch (action.type) {
        case STORE_ACTIONS.OPEN_FILE_REQUEST:
            let file = action.payload;

            if (state.indexOf(file) !== -1) {
                return state;
            }

            return state.concat([action.payload]);

        case STORE_ACTIONS.CLOSE_FILE_REQUEST: {
            let file = <FileModel>action.payload;

            return state.filter((openFile) => {
                return openFile.getAbsolutePath() !== file.getAbsolutePath();
            });
        }
    }

    return state;
};

export const selectedFile: ActionReducer = (state: FileModel, action: Action) => {
    switch (action.type) {
        case STORE_ACTIONS.SELECT_FILE_REQUEST:
            return action.payload;
    }

    return state;
};
