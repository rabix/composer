import {Effect, StateUpdates, StateUpdate} from "@ngrx/effects";
import {Injectable} from "@angular/core";
import * as ACTIONS from "../actions";
import {FileApi} from "../../services/api/file.api";
import {Observable} from "rxjs/Rx";

@Injectable()
export class FileEffects {
    constructor(private files: FileApi,
                private updates$: StateUpdates<any>) {
    }

    @Effect()
    public directoryContent$ = this.updates$
        .whenAction(ACTIONS.DIR_CONTENT_REQUEST)
        .map((update: StateUpdate<any>) => update.action.payload)
        .switchMap(path => this.files.getDirContent(path).map(content => ({content, path})))
        .map(content => ({
            type: ACTIONS.UPDATE_DIRECTORY_CONTENT,
            payload: content
        }));

    @Effect()
    public fileContent$ = this.updates$
        .whenAction(ACTIONS.FILE_CONTENT_REQUEST)
        .map((update: StateUpdate<any>) => update.action.payload)
        .mergeMap(path => this.files.getFileContent(path)
            .map(content => {
                return {
                    type: ACTIONS.UPDATE_FILE_CONTENT,
                    payload: {
                        model: content,
                        path: path
                    }
                };
            })
            .catch(err => {
                //noinspection TypeScriptUnresolvedFunction
                return Observable.of({
                    type: ACTIONS.FILE_CONTENT_ERROR,
                    payload: {
                        path: path,
                        error: err
                    }
                })
            })
        );

    @Effect()
    public newFile$ = this.updates$
        .whenAction(ACTIONS.CREATE_FILE_REQUEST)
        .map((update: StateUpdate<any>) => update.action.payload)
        .mergeMap(request => this.files.createFile(request.path, request.content)
            .map(content => {
                return {
                    type: ACTIONS.NEW_FILE_CREATED,
                    payload: {
                        model: content,
                        path: request.path
                    }
                }
            })
            .catch(err => {
                //noinspection TypeScriptUnresolvedFunction
                return Observable.of({
                    type: ACTIONS.NEW_FILE_ERROR,
                    payload: {
                        path: request.path,
                        error: err
                    }
                })
            })
        );

    @Effect()
    public copyFile$ = this.updates$
        .whenAction(ACTIONS.COPY_FILE_REQUEST)
        .map((update: StateUpdate<any>) => update.action.payload)
        .mergeMap(request => this.files.updateFile(request.path, request.content)
            .map(content => {
                return {
                    type: ACTIONS.NEW_FILE_CREATED,
                    payload: {
                        model: content,
                        path: request.path
                    }
                }
            })
            .catch(err => {
                return Observable.of({
                    type: ACTIONS.NEW_FILE_ERROR,
                    payload: {
                        error: err,
                        path: request.path
                    }
                })
            })
        );
}
