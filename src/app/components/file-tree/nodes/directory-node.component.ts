import {Component, Input, forwardRef, Inject, OnInit} from "@angular/core";
import {ContextDirective} from "../../../services/context/context.directive";
import {DirectoryModel} from "../../../store/models/fs.models";
import {DynamicState} from "../../runtime-compiler/dynamic-state.interface";
import {FileTreeService} from "../file-tree.service";
import {MenuItem} from "../../menu/menu-item";
import {TreeViewComponent} from "../../tree-view/tree-view.component";
import {TreeviewExpandableDirective} from "../../tree-view/behaviours/treeview-expandable.directive";
import {TreeViewNode} from "../../tree-view/interfaces/tree-view-node";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";
import {NewFileModalComponent} from "../../common/new-file-modal.component";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {ModalService} from "../../modal/modal.service";
import {DeleteFolderRequestAction} from "../../../action-events/index";

@Component({
    selector: "file-tree:directory",
    directives: [
        ContextDirective,
        TreeViewComponent,
        TreeviewExpandableDirective,
        TreeviewSelectableDirective,
    ],
    template: `
        <div treeview-selectable 
             treeview-expandable 
             [ct-context]="contextMenuItems"
             (onExpansionSwitch)="toggleExpansion($event)">
            <template [ngIf]="isExpandable">
                <span [ngClass]="{'fa-caret-down': isExpanded, 'fa-caret-right': !isExpanded}"
                       class="fa expander">
                </span>
                
                <span [ngClass]="{'fa-folder-o': !isExpanded, 'fa-folder-open-o': isExpanded}"
                      class="fa node-icon">
                </span>
            </template>
            
            <span class="name">{{ model.name }}</span>
            
        </div>
        <template [ngIf]="isExpanded">
            <tree-view [dataProvider]="dataProviderFn"></tree-view>
        </template>
        
    `
})
export class DirectoryNodeComponent implements DynamicState, TreeViewNode, OnInit {

    @Input()
    private model: DirectoryModel;

    public isExpandable: boolean;

    private isExpanded: boolean;

    private contextMenuItems: MenuItem[];

    private dataProviderFn;

    constructor(@Inject(forwardRef(() => FileTreeService))
                private fileTreeService: FileTreeService,
                private modal: ModalService,
                private eventHub: EventHubService) {

        this.isExpanded   = false;
        this.isExpandable = true;
    }

    ngOnInit() {
        this.dataProviderFn = this.fileTreeService
            .createDataProviderForDirectory(this.model.relativePath);
    }

    public toggleExpansion(isExpanded) {

        this.isExpanded = isExpanded;
    }

    public setState(model) {
        this.model = model;

        this.contextMenuItems = [
            new MenuItem("New...", {
                click: () => this.modal.show(NewFileModalComponent, {
                    title: "New File",
                    componentState: {
                        basePath: this.model.absolutePath
                    }
                }),
            }),
            new MenuItem("Delete", {
                    click: () => {
                        this.modal.confirm({
                            title: "Delete Folder?",
                            content: `
                                    Really delete "<strong>${this.model.absolutePath}</strong>"?<br/>
                                    This will delete <strong>ALL</strong> nested files and directories.`,
                            confirmationLabel: "Delete",
                            cancellationLabel: "No, keep it",
                        }).then(
                            resolved => {
                                this.eventHub.publish(new DeleteFolderRequestAction(this.model.absolutePath))
                            },
                            rejected => {
                            }
                        );
                    }
                }
            )
        ];

    }
}
