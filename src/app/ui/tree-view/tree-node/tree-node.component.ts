import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Input,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChildren,
    ViewContainerRef
} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {TreeViewService} from "../tree-view.service";
@Component({
    selector: "ct-tree-node",
    template: `
        <div (dblclick)="toggle($event)"
             (click)="select()"

             [ct-drop-zones]="dragDropZones"
             [ct-drag-enabled]="dragEnabled"
             [ct-drag-image-caption]="dragLabel"
             [ct-drag-image-class]="dragImageClass"
             [ct-drag-transfer-data]="dragTransferData"

             [style.paddingLeft.em]="level"
             [class.selected]="this === (tree.selected | async)"
             class="deep-unselectable clickable node-base {{ type }}">

            <!--Loading icon has a priority-->
            <i *ngIf="loading" class="fa fa-fw fa-circle-o-notch fa-spin"></i>

            <!--Standard icon if the node is contracted or there is no expansion icon-->
            <i *ngIf="!loading && (!_isExpanded || (_isExpanded && !iconExpanded))"
               class="fa fa-fw" 
               data-toggle-icon
               (click)="isExpandable ? toggle($event) : noop"
               [ngClass]="icon"></i>

            <!--Expansion icon if the node is expanded and there is an expansion icon-->
            <i *ngIf="!loading && _isExpanded && !!iconExpanded" 
               class="fa fa-fw expand" 
               data-toggle-icon
               (click)="toggle($event)"
               [ngClass]="iconExpanded"></i>

            <ng-container *ngIf="labelTemplate[type]; else plain">
                <ng-container *ngTemplateOutlet="labelTemplate[type]; context: {$implicit: this}">
                </ng-container>
            </ng-container>

            <ng-template #plain>
                <span>{{label}}</span>
            </ng-template>

        </div>

        <div *ngIf="_isExpanded" class="children">
            <ct-tree-node *ngFor="let child of (children | async)"
                          [id]="child?.id"
                          [type]="child?.type"
                          [typeDisplay]="child?.typeDisplay"
                          [icon]="child?.icon"
                          [label]="child?.label"
                          [labelTemplate]="labelTemplate"
                          [data]="child?.data || {}"
                          [children]="child?.children"
                          [isExpanded]="child?.isExpanded"
                          [isExpandable]="child.isExpandable"
                          [iconExpanded]="child?.iconExpanded"
                          [toggleOnIconOnly]="child?.toggleOnIconOnly"

                          [dragLabel]="child.dragLabel"
                          [dragEnabled]="child.dragEnabled"
                          [dragDropZones]="child.dragDropZones"
                          [dragImageClass]="child.dragImageClass"
                          [dragTransferData]="child.dragTransferData"
                          [level]="level + 1">

            </ct-tree-node>
        </div>
    `,
    styleUrls: ["./tree-node.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeComponent<T> implements OnInit {

    @Input() id: string;
    @Input() type: string;
    @Input() typeDisplay: string;
    @Input() icon: string;
    @Input() label: string;
    @Input() labelTemplate: {[key: string]: TemplateRef<any>};
    @Input() isExpanded: Observable<boolean>;
    @Input() iconExpanded: string;
    @Input() isExpandable: boolean;
    @Input() toggleOnIconOnly = false;

    @Input() children: Observable<any[]>;
    @Input() data: T;

    @Input() dragLabel        = "";
    @Input() dragDropZones    = [];
    @Input() dragImageClass   = "";
    @Input() dragTransferData = {};
    @Input() dragEnabled      = false;

    @Input() selected = false;
    @Input() loading  = false;
    @Input() level    = 0;

    @ViewChildren(TreeNodeComponent)
    private childrenTreeNodes: QueryList<TreeNodeComponent<any>>;

    _isExpanded = false;

    constructor(public tree: TreeViewService,
                private cdr: ChangeDetectorRef,
                private view: ViewContainerRef) {
    }

    ngOnInit() {

        this.tree.nodeInit.next(this);

        if (this.isExpanded instanceof Observable) {

            this.isExpanded.subscribe(expand => {

                this._isExpanded = expand;
                if (expand) {
                    return this.expand();
                }

                return this.contract();

            });
        }
    }

    toggle(event: MouseEvent) {

        // Only clicking on data-toggle-icon can toggle
       if (!this.toggleOnIconOnly || event.srcElement.getAttribute("data-toggle-icon") !== null) {

           if (this._isExpanded) {
               return this.contract();
           }

           if (this.isExpandable) {
               return this.expand();
           }
       }

        this.open();
    }

    open() {
        this.tree.open.next(this);
    }

    expand(force = false) {
        const wasContracted = this._isExpanded === false;

        this.modify((n) => n._isExpanded = true);

        if (wasContracted || force) {
            this.tree.expansionChanges.next(this);
        }
    }

    contract() {

        const wasExpanded = this._isExpanded === true;
        this.modify((n) => n._isExpanded = false);

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

    getExpansionState(): boolean {
        return this._isExpanded;
    }

    @HostListener("contextmenu", ["$event"])
    private onRightClick(event: MouseEvent) {
        event.stopPropagation();
        this.tree.contextMenu.next({node: this, coordinates: {x: event.clientX, y: event.clientY}});
    }

}
