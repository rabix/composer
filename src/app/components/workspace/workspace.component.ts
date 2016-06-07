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
    }

    ngOnInit() {

        //noinspection TypeScriptUnresolvedFunction
        Observable.fromEvent(window, "resize").debounceTime(200).subscribe(() => {
            this.layout.updateSize(this.el.nativeElement.clientWidth, this.el.nativeElement.clientHeight);
        });

        //noinspection TypeScriptUnresolvedFunction
        Observable.fromEvent(this.layout, "componentCreated")
            .filter((event: any) => {
                return event.config.componentName === CodeEditorComponent
                    && event.parent.contentItems.length === 1
                    && event.parent.contentItems[0].config.componentName === FileEditorPlaceholderComponent
            })
            .subscribe((event: any) => {
                event.parent.contentItems[0].remove();
            });

        //noinspection TypeScriptUnresolvedFunction
        Observable.fromEvent(this.layout, "itemDestroyed")
            .do((event: any) => {
                if (event.config.componentName === CodeEditorComponent) {
                    this.workspaceService.closeFile(event.config.componentState.fileInfo);
                }
            })
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

        // @todo(maya) create an algorithm that does less work and isn't dependent on pairwise
        this.workspaceService.openFiles
            .pairwise()
            .subscribe(fileState => {
                // pairwise returns an Observable of an array of two items:
                // [previousValue, currentValue]
                let prev    = fileState[0];
                let current = fileState[1];

                let added = current.filter((file) => {
                    return prev.indexOf(file) === -1;
                });

                added.forEach((file) => {
                    this.registry.registerComponent(CodeEditorComponent);
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

        //@todo(maya) implement multiple selected files for multiple panes
        this.workspaceService.selectedFile
            .filter(file => file) // ensure that file is not undefined
            .subscribe(file => {
                let activeTab = this.layout.root.contentItems[0].contentItems[1].contentItems.filter((contentItem) => {
                    return contentItem.config.componentState.fileInfo === file;
                })[0];

                this.layout.root.contentItems[0].contentItems[1].setActiveContentItem(activeTab);
            });
    }

    ngAfterViewInit() {
        this.layout.init();

        //@todo(maya): move this elsewhere
        //noinspection TypeScriptUnresolvedFunction
        Observable.fromEvent(this.layout.root.contentItems[0].contentItems[1], "activeContentItemChanged")
            .subscribe((event: any) => {
                this.workspaceService.selectFile(event.config.componentState.fileInfo);
            });

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
