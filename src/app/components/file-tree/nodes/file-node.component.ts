import {Component, Input, forwardRef, Inject} from "@angular/core";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";
import {FileTreeService} from "../file-tree.service";
import {FileModel} from "../../../store/models/fs.models";
import {DynamicState} from "../../runtime-compiler/dynamic-state.interface";
import {TreeViewNode} from "../../tree-view/interfaces/tree-view-node";
import {Subscription} from "rxjs/Rx";
import {ContextDirective} from "../../../services/context/context.directive";
import {MenuItem} from "../../menu/menu-item";
import {ModalService} from "../../modal/modal.service";
import {NewFileModalComponent} from "../../common/new-file-modal.component";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {DeleteFileRequestAction} from "../../../action-events/index";
import {SaveAsModalComponent} from "../../common/save-as-modal.component";

@Component({
    selector: "file-tree:file",
    directives: [TreeviewSelectableDirective, ContextDirective],
    host: {
        "(dblclick)": "onDoubleClick()"
    },
    template: `
        <div treeview-selectable [ct-context]="contextMenuItems">
            <span class="expander"></span>
            <span class="fa fa-file-o node-icon"></span>
            
             <span class="name">
                {{ file?.name }}<span *ngIf="file?.isModified">*</span>
            </span>
        </div>
        
    `
})
export class FileNodeComponent implements DynamicState, TreeViewNode {

    public isExpandable = false;

    @Input()
    private file: FileModel;

    private fileWatcher: Subscription;

    private contextMenuItems: MenuItem[];

    constructor(@Inject(forwardRef(() => FileTreeService))
                private fileTreeService: FileTreeService,
                private eventHub: EventHubService,
                private modal: ModalService) {

        this.contextMenuItems = [
            new MenuItem("New...", {
                click: () => this.modal.show(NewFileModalComponent, {
                    title: "New File",
                    componentState: {
                        basePath: this.file.parentDir
                    }
                }),
            }),
            new MenuItem("Save As...", {
                click: () => this.modal.show(SaveAsModalComponent, {
                    title: "Copy File",
                    componentState: {
                        filePath: this.file.absolutePath
                    }
                })
            }),
            new MenuItem("Delete", {
                    click: () => {
                        this.modal.confirm({
                            title: "Delete File?",
                            content: `Really delete "<strong>${this.file.name}</strong>?"`,
                            confirmationLabel: "Delete",
                            cancellationLabel: "No, keep it",
                        }).then(
                            resolved => {
                                this.eventHub.publish(new DeleteFileRequestAction(this.file))
                            },
                            rejected => {
                            }
                        );
                    }
                }
            )];
    }

    private onDoubleClick() {
        this.fileTreeService.openFile(this.file);
        if (!this.fileWatcher) {

            this.fileWatcher = this.fileTreeService.watchFile(this.file).subscribe(file => {
                this.file = file;
            });
        }
    }

    public setState(file) {
        this.file = file;
    }

    ngOnDestroy() {
        if (this.fileWatcher) {
            this.fileWatcher.unsubscribe();
        }
    }

}
