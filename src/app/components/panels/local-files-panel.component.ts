import {Component, ChangeDetectorRef, ChangeDetectionStrategy, Input} from "@angular/core";
import {TreeViewComponent} from "../tree-view";
import {PanelToolbarComponent} from "./panel-toolbar.component";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {BehaviorSubject, Observable} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {IpcService} from "../../services/ipc.service";
import {ModalService} from "../modal/modal.service";
import {NewFileModalComponent} from "../modal/custom/new-file-modal.component";
import {MenuItem} from "../menu/menu-item";
import {OpenTabAction} from "../../action-events/index";
import {noop} from "../../lib/utils.lib";

const {app} = window.require("electron").remote;

@Component({
    selector: "ct-local-files-panel",
    directives: [TreeViewComponent, PanelToolbarComponent],
    providers: [LocalDataSourceService, IpcService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {"class": "block"},
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Local Files</span>
        </ct-panel-toolbar>
        
        <ct-tree-view [nodes]="nodes | async"></ct-tree-view>
    `
})
export class LocalFilesPanelComponent {

    @Input()
    private nodes = new BehaviorSubject([]);

    constructor(private fs: LocalDataSourceService,
                private modal: ModalService,
                private eventHub: EventHubService) {

        // Gets the absolute path to the current user's Home folder
        const homePath = app.getPath("home");

        this.nodes.next([
            {
                name: "Home",
                icon: "folder",
                childrenProvider: this.recursivelyMapChildrenToNodes(() => this.fs.watch(homePath)),
                contextMenu: [
                    new MenuItem("New File...", {
                        click: () => this.createNewFileModal(homePath)
                    }),
                    new MenuItem("Remove from Workspace", {
                        click: () => {
                        }
                    })
                ],
            }
        ]);
    }


    /**
     * Produces an array of menu items that should appear as the context menu for a particular item
     * @param item
     * @returns {MenuItem[]}
     */
    private createContextMenu(item): MenuItem[] {

        const items = [];

        const newFile = new MenuItem("New File...", {
            click: () => this.createNewFileModal(item.isDir ? item.path : item.dirname)
        });

        const newFolder = new MenuItem("New Folder...", {
            click: () => {
            }
        });

        const remove = new MenuItem("Delete", {
            click: () => {
                this.modal.confirm({
                    title: "Really Delete?",
                    content: `Are you sure that you want to delete “${item.path}”?`,
                    cancellationLabel: "No, keep it",
                    confirmationLabel: "Yes, delete it"
                }).then(() => this.fs.remove(item.path), noop);
            }
        });

        items.push(newFile);
        if (item.isDir) {
            items.push(newFolder);
        }
        items.push(remove);

        return items;
    }

    private recursivelyMapChildrenToNodes(childrenProvider) {
        if (!childrenProvider) {
            return undefined;
        }

        const sortTypes = (a, b) => {
            // If one is a directory and the other one isn't, directory goes to the top
            if (a.isDir && !b.isDir) {
                return -1;
            } else if (!a.isDir && b.isDir) {
                return 1;
            }

            // If one is a workflow, and the other one isn't workflow goes up
            if(a.type === "Workflow" && b.type !== "Workflow"){
                return -1;
            } else if(a.type !== "Workflow" && b.type === "Workflow"){
                return 1;
            }

            // If one is a CLT and the other one isn't, CLT goes up
            if(a.type === "CommandLineTool" && b.type !== "CommandLineTool"){
                return -1;
            } else if(a.type !== "CommandLineTool" && b.type === "CommandLineTool") {
                return 1;
            }

            return 0;
        };

        const sortNames = (a, b) => {
            return a.isDir && b.isDir && a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        };

        return () => childrenProvider().map(items => items
            .sort(sortNames)
            .sort(sortTypes)
            .map(item => {
            return {
                name: item.name,
                icon: item.isDir ? "folder" : (item.type || "file"),
                isExpandable: item.isDir,
                contextMenu: this.createContextMenu(item),
                childrenProvider: this.recursivelyMapChildrenToNodes(item.childrenProvider),
                openHandler: () => {
                    this.eventHub.publish(this.createOpenFileTabAction(item));
                }
            }
        }));
    }

    private createNewFileModal(path) {
        const component    = this.modal.show<NewFileModalComponent>(NewFileModalComponent, {
            title: "Create new File...",
            closeOnOutsideClick: true,
            closeOnEscape: true
        });
        component.basePath = path;

        component.save = (path, content) => {
            const creation = this.fs.createFile(path, content).share();

            creation.subscribe(file => this.eventHub.publish(this.createOpenFileTabAction(file)), noop);

            return creation;
        }
    }

    private createOpenFileTabAction(file) {
        return new OpenTabAction({
            id: file.path,
            title: Observable.of(file.name),
            contentType: Observable.of(file.type || "Code"),
            contentData: {
                data: file,
                isWritable: true,
                content: file.content,
                language: Observable.of(file.language)
            }
        })
    }
}