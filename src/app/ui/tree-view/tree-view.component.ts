import {
    AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, Input, QueryList, TemplateRef,
    ViewChildren
} from "@angular/core";
import {TreeNode} from "./tree-node";
import {TreeNodeComponent} from "./tree-node/tree-node.component";
import {TreeViewService} from "./tree-view.service";
import {TreeNodeLabelDirective} from "./tree-node-label-directive";

@Component({
    selector: "ct-tree-view",
    template: `
        <ct-tree-node *ngFor="let node of nodes"
                      [level]="level"
                      [id]="node?.id"
                      [type]="node?.type"
                      [typeDisplay]="node?.typeDisplay"
                      [icon]="node?.icon"
                      [label]="node?.label"
                      [labelTemplate]="labelTemplate"
                      [data]="node?.data || {}"
                      [children]="node?.children"
                      [dragLabel]="node?.dragLabel"
                      [isExpandable]="node?.isExpandable"
                      [isExpanded]="node?.isExpanded"
                      [toggleOnIconOnly]="node?.toggleOnIconOnly"
                      [dragEnabled]="node?.dragEnabled"
                      [dragDropZones]="node?.dragDropZones"
                      [iconExpanded]="node?.iconExpanded"
                      [dragImageClass]="node?.dragImageClass"
                      [dragTransferData]="node?.dragTransferData">
        </ct-tree-node>
    `,
    providers: [TreeViewService],
    styleUrls: ["./tree-view.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeViewComponent implements AfterContentInit {

    @Input()
    nodes: TreeNode<any>[];

    @Input()
    level = 0;

    @ContentChildren(TreeNodeLabelDirective)
    labelChildren: QueryList<TreeNodeLabelDirective>;

    labelTemplate: {[key: string]: TemplateRef<any>};

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

    ngAfterContentInit () {
        this.labelTemplate = this.labelChildren.reduce((acc, item) => {
            return Object.assign(acc, {[item.type]: item.templateRef});
        }, {});
    }
}
