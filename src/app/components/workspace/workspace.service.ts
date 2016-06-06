import {Injectable} from "@angular/core";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {Store} from "@ngrx/store";
import {ComponentRegistry} from "./registry/component-registry";

@Injectable()
export class WorkspaceService {
    private layout: any;
    private componentRegistry: ComponentRegistry;

    constructor(private store: Store) {

        // @todo(maya) create an algorithm that does less work and isn't dependent on pairwise
        this.store.select('openFiles')
            .pairwise()
            .subscribe(fileState => {
            // pairwise returns an Observable of an array of two items:
            // [previousValue, currentValue]
            let prev = fileState[0];
            let current = fileState[1];

            let added = current.filter((file) => {
                return prev.indexOf(file) === -1;
            });

            added.forEach((file) => {
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
        });

        this.store.select('selectedFile')
            .filter(file => {
                return file;
            })
            .subscribe(file => {
                console.log('selectedFile', file);

                //handle file select
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
