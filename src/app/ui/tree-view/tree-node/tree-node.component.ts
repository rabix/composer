import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnInit,
    QueryList,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import {TreeViewService} from "../tree-view.service";

@Component({
    selector: "ct-tree-node",
    template: `
        <div (dblclick)="toggle()"
             (click)="select()"
             [style.paddingLeft.em]="level"
             [class.selected]="this === (tree.selected | async)"
             class="deep-unselectable clickable node-base {{ type }}">

            <!--Loading icon has a priority-->
            <i *ngIf="loading" class="fa fa-fw fa-circle-o-notch fa-spin"></i>
            <!--Standard icon if the node is contracted or there is no expansion icon-->
            <i *ngIf="!loading && (!isExpanded || (isExpanded && !iconExpanded))" class="fa fa-fw" [ngClass]="icon"></i>
            <!--Expansion icon if the node is expanded and there is an expansion icon-->
            <i *ngIf="!loading && isExpanded  && iconExpanded" class="fa fa-fw" [ngClass]="iconExpanded"></i>

            {{ label }}
        </div>

        <div *ngIf="isExpanded && children?.length" class="children">
            <ct-tree-node *ngFor="let child of children"
                          [id]="child?.id"
                          [type]="child?.type"
                          [icon]="child?.icon"
                          [label]="child?.label"
                          [data]="child?.data || {}"
                          [isExpanded]="child.isExpanded"
                          [isExpandable]="child.isExpandable"
                          [iconExpanded]="child?.iconExpanded"
                          [children]="child.children"
                          [level]="level + 1"
            ></ct-tree-node>
        </div>
    `,
    styleUrls: ["./tree-node.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeComponent<T> implements OnInit {


    @Input() id: string;
    @Input() type: string;
    @Input() icon: string;
    @Input() label: string;
    @Input() isExpanded = false;
    @Input() iconExpanded: string;
    @Input() isExpandable: boolean;
    @Input() children   = [];
    @Input() data: T;

    @Input() selected = false;
    @Input() loading  = false;
    @Input() level    = 0;

    @ViewChildren(TreeNodeComponent)
    private childrenTreeNodes: QueryList<TreeNodeComponent<any>>;

    constructor(public tree: TreeViewService,
                private cdr: ChangeDetectorRef,
                private view: ViewContainerRef) {
    }

    ngOnInit() {

        if (this.isExpanded) {
            this.expand();
        }

        this.tree.nodeInit.next(this);
    }

    toggle() {
        if (this.isExpanded) {
            return this.contract();
        }

        if (this.isExpandable) {
            return this.expand();
        }

        this.open();
    }

    open() {
        this.tree.open.next(this);
    }

    expand() {
        this.isExpanded = true;
        this.tree.expansionChanges.next(this);
    }

    contract() {
        this.isExpanded = false;
        this.tree.expansionChanges.next(this);
    }

    select() {
        this.tree.selected.next(this);
    }

    getViewContainer(): ViewContainerRef {
        return this.view;
    }

    modify(update: (treeNode?: TreeNodeComponent<T>) => void, forceDetection = false): void {
        update(this);
        this.cdr.markForCheck();
        if (forceDetection) {
            this.cdr.detectChanges();
        }
    }

    getChildren(): QueryList<TreeNodeComponent<any>> {
        return this.childrenTreeNodes;
    }

}
