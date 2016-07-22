import {Component, Input, forwardRef, Inject, OnInit} from "@angular/core";
import {DirectoryModel} from "../../../store/models/fs.models";
import {DynamicState} from "../../runtime-compiler/dynamic-state.interface";
import {FileTreeService} from "../file-tree.service";
import {TreeViewComponent} from "../../tree-view/tree-view.component";
import {TreeviewExpandableDirective} from "../../tree-view/behaviours/treeview-expandable.directive";
import {TreeViewNode} from "../../tree-view/interfaces/tree-view-node";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";

@Component({
    selector: "file-tree:directory",
    directives: [TreeviewSelectableDirective, TreeviewExpandableDirective, TreeViewComponent],
    template: `
        <div treeview-selectable treeview-expandable (onExpansionSwitch)="toggleExpansion($event)">
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


    @Input() model: DirectoryModel;
    private isExpandable = true;
    private isExpanded   = false;

    private dataProviderFn;

    constructor(@Inject(forwardRef(() => FileTreeService))
                private fileTreeService: FileTreeService) {

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
    }
}
