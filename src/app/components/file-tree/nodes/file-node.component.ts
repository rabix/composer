import {Component, Input} from "@angular/core";
import {TreeViewNode} from "../../tree-view/interfaces/tree-view-node";
import {TreeviewSelectableDirective} from "../../tree-view/behaviours/treeview-selectable.directive";

@Component({
    selector: "file-tree:file",
    directives: [TreeviewSelectableDirective],
    template: `
        <div treeview-selectable>
            <span class="expander"></span>
            <span class="fa fa-file-o node-icon"></span>
            
             <span class="name">
                {{ model.name }}
            </span>
        </div>
        
    `
})
export class FileNodeComponent implements TreeViewNode {
    isExpandable = false;

    @Input() model;
}
