import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DirectoryModel} from "../store/models/fs.models";
import {Store} from "@ngrx/store";
import * as ACTIONS from "../store/actions";
import {FileEffects} from "../store/effects/file.effects";

export interface IFileChanges {
    content: string;
    source: string
}

@Injectable()
export class FileRegistry {

    /**
     * Contains a map of file identifiers to their *content*
     */
    private fileCache: {[fileId: string]: BehaviorSubject<IFileChanges>} = {};
    private dirCache: DirectoryModel[]                                   = [];

    constructor(private store: Store, private fileEffects: FileEffects) {
        fileEffects.fileContent$.subscribe(this.store);
    }


    public loadFile(path: string): any {
        // check if file exists in cache
        if (this.fileCache[path]) {
            let content = this.fileCache[path].getValue().content;

            this.fileCache[path].next({
                content: content,
                source: 'FILE_API'
            });

            return this.fileCache[path];
        } else {

            // dispatch request for file contents (picked up by FileEffects.fileContent$
            this.store.dispatch({type: ACTIONS.FILE_CONTENT_REQUEST, payload: path});

            // create a behavior subject for file content, add it to cache
            this.fileCache[path] = new BehaviorSubject({
                source: 'FILE_API',
                content: null
            });

            // when file content is retrieved, check if it's for the correct file, and push
            // new value to cached behavior subject.
            this.store.select("fileContent").subscribe(file => {
                //@todo(maya) error handling
                if(file && file.path === path) {
                    this.fileCache[path].next({
                        content: file.model.content,
                        source: 'FILE_API'
                    });
                }
            });

            return this.fileCache[path];
        }
    }
}
