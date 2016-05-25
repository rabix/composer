import {Injectable} from "@angular/core";
import {FileTreeService} from "../file-tree/file-tree-service";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {FileApi} from "../../services/api/file.api";
import {ComponentRegistry} from "./registry/component-registry";

@Injectable()
export class WorkspaceService {
    private layout: any;
    private componentRegistry: ComponentRegistry;

    constructor(private fileTreeService: FileTreeService, fileApi: FileApi) {


        this.fileTreeService.fileOpenStream.subscribe(file => {

            this.componentRegistry.registerComponent(CodeEditorComponent);

            this.layout.root.contentItems[0].contentItems[1].addChild({
                type: "component",
                title: file.name,
                componentName: CodeEditorComponent,
                componentState: {
                    fileInfo: file
                },
            });
        });
    }

    /**
     * @TODO(ivanb) move layout initialization to this service's constructor
     * @param layout
     */
    public setLayout(layout: any) {
        this.layout = layout;
    }

    public setRegistry(registry: ComponentRegistry) {
        this.componentRegistry = registry;
    }

}
