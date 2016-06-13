import {Injectable, forwardRef, Inject, ComponentResolver} from "@angular/core";
import {DirectoryDataProviderFactory} from "./types";
import {Store} from "@ngrx/store";
import * as STORE_ACTIONS from "../../store/actions";
import {FileModel, FSItemModel, DirectoryModel} from "../../store/models/fs.models";
import {FileStateService, FSItemMap} from "../../state/file.state.service";
import {FileApi} from "../../services/api/file.api";
import {Observable} from "rxjs/Rx";
import {FileNodeComponent} from "./nodes/file-node.component";
import {DirectoryNodeComponent} from "./nodes/directory-node.component";
import {DynamicComponentContext} from "../runtime-compiler/dynamic-component-context";


@Injectable()
export class FileTreeService {

    constructor(private store: Store<any>,
                private fileApi: FileApi,
                private resolver: ComponentResolver,
                private fileRegistry: FileStateService) {
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

    public createDataProviderForDirectory(relPathDir = ""): DirectoryDataProviderFactory {


        return () => {

            this.fileApi.getDirContent(relPathDir)
                .subscribe(data => this.fileRegistry.createItem(data));

            return this.fileRegistry.registry.map((chunk: FSItemMap) => {
                let filtered = [];

                for (let key in chunk) {
                    let i     = chunk[key];
                    let fname = relPathDir.length === 0 ? i.name : `${relPathDir}/${i.name}`;

                    if (i.relativePath === fname) {
                        filtered.push(i);
                    }
                }

                return filtered;
            }).distinctUntilChanged((a, b) => {
                return Object.keys(a).length === Object.keys(b).length;
            }).map(filtered => {
                return <any>Observable.defer(() => {
                    return Observable.fromPromise(Promise.all(filtered.map((item: FSItemModel) => {
                        let componentType: any = FileNodeComponent;
                        if (item instanceof DirectoryModel) {
                            componentType = DirectoryNodeComponent;
                        }

                        return this.resolver.resolveComponent(componentType)
                            .then(
                                factory => new DynamicComponentContext(factory, item),
                                err => {
                                    throw new Error(`Component Compilation Error: ${err}`)
                                }
                            );

                    })));
                });
            }).concatAll();
        };
    }
}
