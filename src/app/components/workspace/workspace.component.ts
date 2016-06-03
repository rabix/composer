import {Component, ElementRef} from "@angular/core";
import * as GoldenLayout from "golden-layout";
import {Observable} from "rxjs/Observable";
import {ComponentRegistry} from "./registry/component-registry";
import {ComponentRegistryFactoryService} from "./registry/component-registry-factory.service";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {FileTreeComponent} from "../file-tree/file-tree.component";
import {WorkspaceService} from "./workspace.service";
import {FileEditorPlaceholderComponent} from "../placeholders/file-editor/file-editor-placeholder.component";

require("./workspace.component.scss");

@Component({
    selector: "workspace",
    template: "",
    providers: []
})
export class WorkspaceComponent {

    private layout: any;
    private registry: ComponentRegistry;

    constructor(private el: ElementRef,
                private registryFactory: ComponentRegistryFactoryService,
                private workspaceService: WorkspaceService) {

        this.layout   = new GoldenLayout(this.getLayoutConfig(), this.el.nativeElement);
        this.registry = registryFactory.create(this.layout);
        this.workspaceService.setRegistry(this.registry);
    }

    ngOnInit() {

        Observable.fromEvent(window, "resize").debounceTime(200).subscribe(() => {
            this.layout.updateSize(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
        });

        Observable.fromEvent(this.layout, "componentCreated")
            .filter((event: any) => {
                return event.config.componentName === CodeEditorComponent
                    && event.parent.contentItems.length === 1
                    && event.parent.contentItems[0].config.componentName === FileEditorPlaceholderComponent
            })
            .subscribe((event: any) => {
                event.parent.contentItems[0].remove();
            });

        Observable.fromEvent(this.layout, "itemDestroyed")
            .filter((event: any) => {
                return event.config.componentName === CodeEditorComponent
                    && event.parent.contentItems.length === 1
            })
            .subscribe((event: any) => {

                // @TODO(ivanb) Move this somewhere (ex. extract the component definition into an enum)
                // @FIXME(ivanb) Scan the whole tree and check if this is actually the last open editor
                event.parent.addChild({
                    type: "component",
                    title: "Usage Tip",
                    componentName: FileEditorPlaceholderComponent,
                    isClosable: false
                });
            });
    }

    ngAfterViewInit() {
        this.layout.init();
        this.workspaceService.setLayout(this.layout);
    }

    private getLayoutConfig() {

        return {
            settings: {
                hasHeaders: true,
                constrainDragToContainer: true,
                reorderEnabled: false,
                selectionEnabled: false,
                popoutWholeStack: false,
                showPopoutIcon: false,
                showMaximiseIcon: true,
                showCloseIcon: true,
            },
            content: [{
                type: "row",
                content: [
                    {
                        type: "component",
                        componentName: FileTreeComponent,
                        title: "Project Navigation",
                        width: 30,
                        isClosable: false
                    },
                    {
                        type: "component",
                        title: "Usage Tip",
                        componentName: FileEditorPlaceholderComponent,
                        isClosable: false
                    }
                ]
            }]
        };
    }
}
