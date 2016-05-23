import {Component, ElementRef} from "@angular/core";
import * as GoldenLayout from "golden-layout";
import {Observable} from "rxjs/Observable";
import {ComponentRegistry} from "./registry/component-registry";
import {ComponentRegistryFactoryService} from "./registry/component-registry-factory.service";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {FileTreeComponent} from "../file-tree/file-tree.component";

require("./workspace.component.scss");

@Component({
    selector: "workspace",
    template: "",
    providers: [ComponentRegistryFactoryService]
})
export class WorkspaceComponent {

    private layout: any;
    private registry: ComponentRegistry;

    constructor(private el: ElementRef, registryFactory: ComponentRegistryFactoryService) {

        this.layout   = new GoldenLayout(this.getLayoutConfig(), this.el.nativeElement);
        this.registry = registryFactory.create(this.layout);
    }

    ngOnInit() {

        //noinspection TypeScriptUnresolvedFunction
        Observable.fromEvent(window, "resize").debounceTime(200).subscribe(() => {
            this.layout.updateSize(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
        });
    }

    ngAfterViewInit() {
        this.layout.init();
    }

    private getLayoutConfig() {

        return {
            settings: {
                hasHeaders: true,
                reorderEnabled: true,
                selectionEnabled: false,
                popoutWholeStack: false,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                showCloseIcon: false,
            },
            content: [{
                type: "row",
                content: [
                    {
                        type: "component",
                        componentName: FileTreeComponent,
                        title: "Navigation",
                        width: 25
                    },
                    {
                        type: "component",
                        title: "my-workflow.json",
                        componentName: CodeEditorComponent,
                    }
                ]
            }]
        };
    }
}
