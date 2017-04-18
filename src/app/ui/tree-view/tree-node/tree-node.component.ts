import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, HostListener,
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

             [ct-drag-enabled]="dragEnabled"
             [ct-drag-image-class]="dragImageClass"
             [ct-drag-image-caption]="dragLabel"
             [ct-drag-transfer-data]="dragTransferData"
             [ct-drop-zones]="dragDropZones"

             [style.paddingLeft.em]="level"
             [class.selected]="this === (tree.selected | async)"
             class="deep-unselectable clickable node-base {{ type }}">

            <!--Loading icon has a priority-->
            <i *ngIf="loading" class="fa fa-fw fa-circle-o-notch fa-spin"></i>
            <!--Standard icon if the node is contracted or there is no expansion icon-->
            <i *ngIf="!loading && (!isExpanded || (isExpanded && !iconExpanded))" class="fa fa-fw" [ngClass]="icon"></i>
            <!--Expansion icon if the node is expanded and there is an expansion icon-->
            <i *ngIf="!loading && isExpanded  && !!iconExpanded" class="fa fa-fw" [ngClass]="iconExpanded"></i>

            <span [innerHTML]="label"></span>
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

                          [dragEnabled]="child.dragEnabled"
                          [dragTransferData]="child.dragTransferData"
                          [dragLabel]="child.dragLabel"
                          [dragImageClass]="child.dragImageClass"
                          [dragDropZones]="child.dragDropZones"

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
    @Input() children = [];
    @Input() data: T;

    @Input() dragEnabled = false;
    @Input() dragTransferData = {};
    @Input() dragLabel = "";
    @Input() dragImageClass = "";
    @Input() dragDropZones = [];

    @Input() selected = false;
    @Input() loading = false;
    @Input() level = 0;

    @ViewChildren(TreeNodeComponent)
    private childrenTreeNodes: QueryList<TreeNodeComponent<any>>;

    constructor(public tree: TreeViewService,
                private cdr: ChangeDetectorRef,
                private view: ViewContainerRef) {
    }

    ngOnInit() {


        this.tree.nodeInit.next(this);

        if (this.isExpanded) {
            this.expand(true);
        }
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

    expand(force = false) {

        const wasContracted = this.isExpanded === false;
        this.isExpanded = true;

        if (wasContracted || force) {
            this.tree.expansionChanges.next(this);
        }
    }

    contract() {

        const wasExpanded = this.isExpanded === true;
        this.isExpanded = false;

        if (wasExpanded) {
            this.tree.expansionChanges.next(this);
        }

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

    @HostListener("contextmenu", ["$event"])
    private onRightClick(event: MouseEvent) {
        event.stopPropagation();
        this.tree.contextMenu.next({node: this, coordinates: {x: event.clientX, y: event.clientY}});
    }

}
