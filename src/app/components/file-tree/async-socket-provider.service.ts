import {Injectable, ComponentResolver, ComponentFactory} from "@angular/core";
import {FileApi} from "../../services/api/file.api";
import {Observable} from "rxjs/Rx";
import {FilePath} from "../../services/api/api-response-types";
import {FileNodeComponent} from "./nodes/file-node.component";
import {DirectoryNodeComponent} from "./nodes/directory-node.component";


@Injectable()
export class AsyncSocketProviderService {

    constructor(private fileApi: FileApi, private resolver: ComponentResolver) {

    }

    public getDirContentComponents(dir? = ""): Observable<ComponentFactory[]> {
        let path = `./${dir}`;

        return this.fileApi.getDirContent(path).map(items => {
            //noinspection TypeScriptUnresolvedFunction
            return Observable.defer(() => {
                //noinspection TypeScriptUnresolvedFunction
                return Observable.fromPromise(Promise.all(items.map((item: FilePath) => {

                    // Determine the component type
                    // This should probably be moved to a factory
                    let componentType = FileNodeComponent;
                    if (item.type === "directory") {
                        componentType = DirectoryNodeComponent;
                    }

                    return this.resolver.resolveComponent(componentType).then((factory: ComponentFactory) => {
                        return {
                            factory: factory,
                            data: item
                        };
                    });

                })));
            });
        }).concatAll();
    }
}

