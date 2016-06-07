import {Injectable} from "@angular/core";
import {FileModel} from "../../store/models/fs.models";
import {Observable} from "rxjs/Rx";
import {Store} from "@ngrx/store";
import * as STORE_ACTIONS from "../../store/actions";

@Injectable()
export class WorkspaceService {
    public openFiles: Observable<FileModel[]>;
    public selectedFile: Observable<FileModel>;

    constructor(private store: Store) {
        this.openFiles    = store.select('openFiles');
        this.selectedFile = store.select('selectedFile');
    }

    public selectFile(file: FileModel): void {
        this.store.dispatch({
            type: STORE_ACTIONS.SELECT_FILE_REQUEST,
            payload: file
        });
    }

    public closeFile(file: FileModel): void {
        this.store.dispatch({
            type: STORE_ACTIONS.CLOSE_FILE_REQUEST,
            payload: file
        });
    }
}
