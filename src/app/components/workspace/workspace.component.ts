import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {Component, ElementRef, OnDestroy} from "@angular/core";
import {ComponentRegistryFactoryService} from "./registry/component-registry-factory.service";
import {ComponentRegistry} from "./registry/component-registry";
import {FileTreeComponent} from "../file-tree/file-tree.component";
import {Observable} from "rxjs/Rx";
import {WorkspaceService} from "./workspace.service";
import {FileEditorPlaceholderComponent} from "../placeholders/file-editor/file-editor-placeholder.component";
import * as GoldenLayout from "golden-layout";
import {FileRegistry} from "../../services/file-registry.service";
import {ToolContainerComponent} from "../tool-container/tool-container.component";

require("./workspace.component.scss");

@Component({
    selector: "workspace",
    template: "",
    providers: [WorkspaceService]
})
export class WorkspaceComponent implements OnDestroy {

    private layout: any;
    private registry: ComponentRegistry;

    constructor(private el: ElementRef,
                private registryFactory: ComponentRegistryFactoryService,
                private files: FileRegistry,
                private workspaceService: WorkspaceService) {

        this.layout   = new GoldenLayout(this.getLayoutConfig(), this.el.nativeElement);
        this.registry = registryFactory.create(this.layout);
    }

    ngAfterViewInit() {
        this.layout.init();


        const el = this.el.nativeElement;
        Observable.fromEvent(window, "resize")
            .debounceTime(50)
            .subscribe(_ => this.layout.updateSize(el.clientWidth, el.clientHeight));

        Observable.fromEvent(this.layout, "componentCreated")
            .filter((event: any) => {
                return event.config.componentName === ToolContainerComponent
                    && event.parent.contentItems.length === 1
                    && event.parent.contentItems[0].config.componentName === FileEditorPlaceholderComponent
            })
            .subscribe((event: any) => {
                event.parent.contentItems[0].remove();
            });

        Observable.fromEvent(this.layout, "itemDestroyed").filter((event: any) => {
            return event.config.componentName === ToolContainerComponent
                && event.parent.contentItems.length === 1
        }).subscribe((event: any) => {
            event.parent.addChild({
                type: "component",
                title: "Usage Tip",
                componentName: FileEditorPlaceholderComponent,
                width: 70,
                isClosable: false
            });
        });

        this.workspaceService.onLoadFile.subscribe(file => {
            this.registry.registerComponent(ToolContainerComponent);
            const tabs = this.layout.root.contentItems[0].contentItems[1];

            tabs.addChild({
                type: "component",
                title: file.name + (file.isModified ? " (modified)" : ""),
                componentName: ToolContainerComponent,
                width: 70,
                componentState: {
                    fileInfo: file,
                }
            });
        });

        this.workspaceService.selectedFile.subscribe(file => {

            if (file) {
                let activeTab = this.registry.findToolTab(file);
                activeTab.setTitle(file.name + (file.isModified ? "*" : ""));
                this.registry.getToolContainerStack().setActiveContentItem(activeTab);
            }

        });

        this.workspaceService.onCloseFile.subscribe(file => {
            this.registry.findToolTab(file).remove();
        });

        Observable.fromEvent(this.layout, "tabCreated")
            .filter((tab: any) => tab.contentItem.componentName === ToolContainerComponent)
            .subscribe((tab: any) => {
                const componentState = tab.contentItem.config.componentState;
                const file           = componentState.fileInfo;

                tab.element.off("click").on("click", ":not(.lm_close_tab)", _ => {
                    this.workspaceService.openFile(file);
                });

                tab.element.find(".lm_close_tab").off("click").on("click", _ => {
                    if (Array.isArray(componentState.subscriptions)) {
                        componentState.subscriptions.forEach(sub => {
                            sub.unsubscribe();
                        });
                    }
                    this.workspaceService.closeFile(file);
                });
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
                        width: 70,
                        isClosable: false
                    }
                ]
            }]
        };
    }

    ngOnDestroy() {
        this.workspaceService.pleaseDontLeaveMemoryLeaks();
    }
}
