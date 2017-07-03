import {ChangeDetectionStrategy, Component, Input, QueryList, ViewChildren} from "@angular/core";
import {TreeNode} from "./tree-node";
import {TreeNodeComponent} from "./tree-node/tree-node.component";
import {TreeViewService} from "./tree-view.service";

@Component({
    selector: "ct-tree-view",
    template: `
        <ct-tree-node *ngFor="let node of nodes"
                      [level]="level"
                      [id]="node?.id"
                      [type]="node?.type"
                      [icon]="node?.icon"
                      [label]="node?.label"
                      [data]="node?.data || {}"
                      [children]="node?.children"
                      [dragLabel]="node?.dragLabel"
                      [isExpanded]="node?.isExpanded"
                      [dragEnabled]="node?.dragEnabled"
                      [dragDropZones]="node?.dragDropZones"
                      [isExpandable]="node?.isExpandable"
                      [iconExpanded]="node?.iconExpanded"
                      [dragImageClass]="node?.dragImageClass"
                      [dragTransferData]="node?.dragTransferData"
        >
        </ct-tree-node>
    `,
    providers: [TreeViewService],
    styleUrls: ["./tree-view.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewComponent {


    @Input()
    nodes: TreeNode<any>[];

    @Input()
    level = 0;

    @ViewChildren(TreeNodeComponent)
    private treeNodes: QueryList<TreeNodeComponent<any>>;

    constructor(public tree: TreeViewService) {
        tree.treeView = this;
    }

    getChildren(): QueryList<TreeNodeComponent<any>> {
        return this.treeNodes;
    }

    getService() {
        return this.tree;
    }
}
