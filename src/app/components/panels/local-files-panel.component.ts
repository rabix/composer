import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, ViewEncapsulation} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs";
import {noop} from "../../lib/utils.lib";
import {ModalService} from "../modal/modal.service";
import {IpcService} from "../../services/ipc.service";
import {MenuItem} from "../../core/ui/menu/menu-item";
import {ComponentBase} from "../common/component-base";
import {WorkboxService} from "../workbox/workbox.service";
import {NewFileModalComponent} from "../modal/custom/new-file-modal.component";
import {LocalDataSourceService} from "../../sources/local/local.source.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

const {app, dialog} = window["require"]("electron").remote;

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-local-files-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {"class": "block"},
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Local Files</span>
            <span class="tc-tools clickable" title="Add Directory to Workspace..." (click)="promptForDirectory()">
                <i class="fa fa-fw fa-plus-circle"></i>
            </span>
        </ct-panel-toolbar>

        <ct-tree-view [nodes]="nodes" [preferenceKey]="'local-files'"></ct-tree-view>
    `
})
export class LocalFilesPanelComponent extends ComponentBase {

    @Input()
    private nodes = [];

    constructor(private modal: ModalService,
                private fs: LocalDataSourceService,
                private ipc: IpcService,
                private detector: ChangeDetectorRef,
                private workbox: WorkboxService,
                private zone: NgZone,
                private preferences: UserPreferencesService) {
        super();
    }

    ngOnInit() {
        this.preferences.get("local_open_folders", []).first().subscribe(files => this.addDirectory(...files));
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
            if (a.type === "Workflow" && b.type !== "Workflow") {
                return -1;
            } else if (a.type !== "Workflow" && b.type === "Workflow") {
                return 1;
            }

            // If one is a CLT and the other one isn't, CLT goes up
            if (a.type === "CommandLineTool" && b.type !== "CommandLineTool") {
                return -1;
            } else if (a.type !== "CommandLineTool" && b.type === "CommandLineTool") {
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
                let icon = item.isDir ? "folder" : (item.type || "file");
                if (!item.isReadable) {
                    icon = "fa-ban text-danger";
                } else if (!item.isWritable) {
                    icon = "fa-lock text-warning";
                }

                return {
                    id: item.path,
                    name: item.name,
                    icon,
                    isExpandable: item.isDir,
                    contextMenu: this.createContextMenu(item),
                    childrenProvider: item.isReadable ? this.recursivelyMapChildrenToNodes(item.childrenProvider) : undefined,
                    openHandler: item.isReadable ? () => {
                        this.openTab(item);
                    } : undefined
                }
            }));
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

        const newFolder = new MenuItem("New Directory...", {
            click: () => this.createNewDirectoryModal(item.path)
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

    private createNewFileModal(path) {
        const component = this.modal.show(NewFileModalComponent, {
            title: "Create new File...",
            closeOnOutsideClick: true,
            closeOnEscape: true
        });

        component.basePath = path;

        component.save = (path, content) => {
            const creation = this.fs.createFile(path, content).share();

            creation.subscribe(file => {
                this.openTab(file);
            });

            return creation;
        }
    }

    private createNewDirectoryModal(basePth) {
        const dirNameInput = new FormControl("",
            [control => control.value ? null : {err: "Path must not be empty"}],
            [control => this.ipc.request("pathExists", `${basePth}/${control.value}`, this.zone).first()
                .map(r => r.exists ? {err: "That path is taken."} : null)]
        );

        this.modal.prompt({
            title: "New Folder",
            cancellationLabel: "Cancel",
            confirmationLabel: "Create",
            content: "Folder Name",
            formControl: dirNameInput
        }).then((name) => {
            const fullPath = [basePth, name].join("/");
            this.fs.createDirectory(fullPath).subscribe(() => {
                this.triggerChange();
            });
        }, noop);
    }

    private openTab(file) {

        this.workbox.openTab({
            id: file.path,
            title: Observable.of(file.name),
            contentType: Observable.of(file.type || "Code"),
            contentData: {
                data: file,
                isWritable: true,
                content: file.content,
                language: Observable.of(file.language)
            }
        });
    }

    private promptForDirectory() {
        dialog.showOpenDialog({
            title: "Choose a Directory",
            defaultPath: app.getPath("home"),
            buttonLabel: "Add to Workspace",
            properties: ["openDirectory", "multiSelections"]
        }, (paths) => {
            this.addDirectory(...paths);
        });
    }


    private addDirectory(...paths: string[]) {
        if (!paths) {
            return;
        }

        const newNodes = paths.filter(path => !this.nodes.find(item => item.id === path)).map(path => {

            return {
                id: path,
                name: path.split("/").pop(),
                icon: "folder",
                childrenProvider: this.recursivelyMapChildrenToNodes(() => this.fs.watch(path)),
                contextMenu: [
                    new MenuItem("New File...", {
                        click: () => this.createNewFileModal(path)
                    }),
                    new MenuItem("New Directory...", {
                        click: () => this.createNewDirectoryModal(path)
                    }),
                    new MenuItem("Remove from Workspace", {
                        click: () => {
                            this.removeDirectory(path);
                        }
                    })
                ],
            };
        });

        this.nodes = this.nodes.concat(newNodes);
        this.triggerChange();

        this.saveWorkspacePreferences();
    }

    private removeDirectory(path) {
        this.nodes = this.nodes.filter(i => i.id !== path);
        this.saveWorkspacePreferences();
    }

    private saveWorkspacePreferences() {
        this.preferences.put("local_open_folders", this.nodes.map(node => node.id));
    }

    private triggerChange() {
        this.detector.markForCheck();
        this.detector.detectChanges();
    }
}
