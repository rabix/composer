import {ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren} from "@angular/core";
import {TreeNode} from "./tree-node";
import {TreeNodeComponent} from "./tree-node/tree-node.component";
import {TreeViewService} from "./tree-view.service";

@Component({
    selector: "ct-tree-view",
    template: `
        <ct-tree-node *ngFor="let node of nodes"
                      [id]="node?.id"
                      [level]="level"
                      [type]="node?.type"
                      [icon]="node?.icon"
                      [label]="node?.label"
                      [data]="node?.data || {}"
                      [children]="node.children"
                      [isExpanded]="node.isExpanded"
                      [isExpandable]="node.isExpandable"
                      [iconExpanded]="node?.iconExpanded">
        </ct-tree-node>
    `,
    styleUrls: ["./tree-view.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewComponent {
    @Input()
    nodes: TreeNode<any>[];

    @Input()
    level = 0;

    @ViewChildren(TreeNodeComponent)
    private treeNodes: QueryList<TreeNodeComponent>;

    constructor(private tree: TreeViewService) {
        tree.treeView = this;
    }

    getChildren(): QueryList<TreeNodeComponent> {
        return this.treeNodes;
    }
}
