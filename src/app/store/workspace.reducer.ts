import {ActionReducer, Action} from "@ngrx/store";
import {FileModel} from "./models/fs.models";
import * as STORE_ACTIONS from "./actions";

export const OPEN_FILES_INITIAL_STATE = [];

export const openFiles: ActionReducer<FileModel[]> = (state: FileModel[] = OPEN_FILES_INITIAL_STATE, action: Action) => {

    switch (action.type) {
        case STORE_ACTIONS.OPEN_FILE_REQUEST:
            let file = action.payload;

            if (state.indexOf(file) !== -1) {
                return state;
            }

            return state.concat([file]);

        case STORE_ACTIONS.CLOSE_FILE_REQUEST: {
            let file = <FileModel>action.payload;

            return state.filter((openFile) => {
                return openFile.absolutePath !== file.absolutePath;
            });
        }
    }

    return state;
};

export const selectedFile: ActionReducer<FileModel> = (state: FileModel, action: Action) => {
    switch (action.type) {
        case STORE_ACTIONS.SELECT_FILE_REQUEST:
            //@todo(maya) implement multiple selected files for multiple panes
            return action.payload;
        case STORE_ACTIONS.DESELECT_FILE_REQUEST:
            return null;
    }

    return state;
};
