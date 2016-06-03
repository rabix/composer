import {ActionReducer, Action} from "@ngrx/store";
import {UPDATE_DIRECTORY_CONTENT} from "./actions";
import {FilePath} from "../services/api/api-response-types";
import {TreeNode} from "./models/treeview.models";

export const directoryTree: ActionReducer = (state: TreeNode[] = [], action: Action) => {

    switch (action.type) {
        case UPDATE_DIRECTORY_CONTENT: {
            let content      = <FilePath[]>action.payload.content;
            let pathElements = <string[]>action.payload.path
                .split('/')
                .filter(x => [".", " ", ""].indexOf(x) !== -1);


            return state;
        }
    }

    return state;
};
