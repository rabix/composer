import {Injectable, ComponentResolver} from "@angular/core";
import {DirectoryDataProviderFactory} from "./types";
import {FileModel, FSItemModel, DirectoryModel} from "../../store/models/fs.models";
import {FileStateService, FSItemMap} from "../../state/file.state.service";
import {FileApi} from "../../services/api/file.api";
import {Observable} from "rxjs/Rx";
import {FileNodeComponent} from "./nodes/file-node.component";
import {DirectoryNodeComponent} from "./nodes/directory-node.component";
import {DynamicComponentContext} from "../runtime-compiler/dynamic-component-context";
import {OpenFileRequestAction} from "../../action-events/index";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileRegistry} from "../../services/file-registry.service";


@Injectable()
export class FileTreeService {

    constructor(private fileApi: FileApi,
                private resolver: ComponentResolver,
                private eventHub: EventHubService,
                private files: FileRegistry,
                private fileRegistry: FileStateService) {

    }

    public openFile(file: FileModel) {
        this.eventHub.publish(new OpenFileRequestAction(file));
    }

    public watchFile(file: FileModel) {
        return this.files.watchFile(file);
    }

    public createDataProviderForDirectory(relPathDir = ""): DirectoryDataProviderFactory {


        return () => {

            this.fileApi.getDirContent(relPathDir).subscribe(data => this.fileRegistry.createItem(data));

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

                const ordered = filtered.sort((a: FileModel, b: FileModel) => a.name.localeCompare(b.name));

                return <any>Observable.defer(() => {
                    return Observable.fromPromise(Promise.all(ordered.map((item: FSItemModel) => {
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
