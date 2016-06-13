import {Injectable, forwardRef, Inject} from "@angular/core";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {DirectoryDataProviderFactory} from "./types";
import {Store} from "@ngrx/store";
import * as STORE_ACTIONS from "../../store/actions";
import {FileModel} from "../../store/models/fs.models";
import {FileStateService} from "../../state/file.state.service";


@Injectable()
export class FileTreeService {
    private _subscriptions = [];

    constructor(@Inject(forwardRef(() => AsyncSocketProviderService))
                private dataProvider: AsyncSocketProviderService,
                private store: Store,
                private files: FileStateService) {

        this.files.create.subscribe((item) => {
            console.log("New file is created, should be inserted into the tree", item);
        })
    }

    /**
     * Dispatches info about file being double clicked to `store`
     * @param {FileModel} fileInfo
     * @TODO remove the store dispatching, architectural change
     */
    public openFile(fileInfo: FileModel): void {
        this.store.dispatch({type: STORE_ACTIONS.OPEN_FILE_REQUEST, payload: fileInfo});
        this.store.dispatch({type: STORE_ACTIONS.SELECT_FILE_REQUEST, payload: fileInfo});
    }

    public createDataProviderForDirectory(directory = ""): DirectoryDataProviderFactory {

        return <DirectoryDataProviderFactory>(() => this.dataProvider.getNodeContent(directory));
    }
}
