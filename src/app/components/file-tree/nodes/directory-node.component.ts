import {Component, Input, Injector} from "@angular/core";
import {FilePath} from "../../../services/api/api-response-types";
import {TreeViewNode} from "../../tree-view/interfaces/tree-view-node";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";
import {TreeviewExpandableDirective} from "../../tree-view/behaviours/treeview-expandable.directive";
import {FileTreeService} from "../file-tree-service";
import {TreeViewComponent} from "../../tree-view/tree-view.component";

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
            <tree-view [injector]="injector" [dataProvider]="dataProviderFn"></tree-view>
        </template>
        
    `
})
export class DirectoryNodeComponent implements TreeViewNode {

    @Input() model: FilePath;
    private isExpandable = true;
    private isExpanded   = false;

    private dataProviderFn;

    constructor(private fileTreeService: FileTreeService, private injector: Injector) {

    }

    ngOnInit() {
        this.isExpandable   = !this.model.isEmpty;
        console.log("Do model", this.model);
        this.dataProviderFn = this.fileTreeService.getDataProviderForDirectory(this.model.absolutePath);
    }
    
    public toggleExpansion(isExpanded) {

        this.isExpanded = isExpanded;
    }
}
