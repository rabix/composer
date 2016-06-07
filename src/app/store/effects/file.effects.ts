import {Effect, StateUpdates, StateUpdate} from "@ngrx/effects";
import {Injectable} from "@angular/core";
import * as ACTIONS from "../actions";
import {FileApi} from "../../services/api/file.api";

@Injectable()
export class FileEffects {
    constructor(private files: FileApi,
                private updates$: StateUpdates<StateUpdate>) {
    }

    @Effect()
    public directoryContent$ = this.updates$
        .whenAction(ACTIONS.DIR_CONTENT_REQUEST)
        .map((update: StateUpdate<StateUpdate>) => update.action.payload)
        .switchMap(path => this.files.getDirContent(path).map(content => ({content, path})))
        .map(content => ({
            type: ACTIONS.UPDATE_DIRECTORY_CONTENT,
            payload: content
        }));

    @Effect()
    public fileContent$ = this.updates$
        .whenAction(ACTIONS.FILE_CONTENT_REQUEST)
        .map((update: StateUpdate<StateUpdate>) => update.action.payload)
        .switchMap(path => this.files.getFileContent(path).map(content => ({
            model: content,
            path: path
        })))
        .map(content => {
            return {
                type: ACTIONS.UPDATE_FILE_CONTENT,
                payload: content
            }
        })
}
