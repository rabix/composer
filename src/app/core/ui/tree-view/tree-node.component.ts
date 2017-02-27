import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnInit,
    QueryList,
    Renderer,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {TreeNode} from "./types";
import {TreeViewService} from "./tree-view.service";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tree-node",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div #nodeBase
             [ct-drag-enabled]="node.icon === 'CommandLineTool' || node.icon === 'Workflow'"
             [ct-drag-image-class]="node.icon == 'CommandLineTool' ? 'icon-command-line-tool' : 'icon-workflow'"
             [ct-drag-image-caption]="node.name"
             [ct-drag-transfer-data]="node.id"
             [ct-drop-zones]="['zone1']"
             class="deep-unselectable clickable node-base"
             [style.paddingLeft.em]="level * 2"
             [attr.data-index]="nodeIndex"
             [tabindex]="nodeIndex"
             (click)="onClick($event)"
             [class.selected]="isHighlighted | async"
             (dblclick)="toggle()">

            <ct-tree-node-icon class="icon-space"
                               [expanded]="isExpanded"
                               [isLoading]="isLoading"
                               [type]="node.icon"
                               (click)="toggle()">
            </ct-tree-node-icon>

            <span *ngIf="node" class="name-container" [ct-context]="node.contextMenu" [title]="node.name">
                <span class="name" *ngFor="let namePart of nameParts" [innerHTML]="namePart"></span>
            </span>

            <span *ngIf="node.onClose" class="pull-right">
                <button type="button" class="text-primary btn-link no-underline-hover clickable" (click)="node.onClose()">&times;</button>
            </span>
        </div>

        <div *ngIf="isExpanded && nodeChildren" class="children">
            <ct-tree-node [level]="level + 1" *ngFor="let node of nodeChildren" [node]="node"
                          [preferenceKey]="preferenceKey"></ct-tree-node>
            <div *ngIf="nodeChildren.length === 0">
                <span class="icon-space"></span>
                <i class="text-muted">empty </i>
            </div>
        </div>

    `
})
export class TreeNodeComponent extends ComponentBase implements OnInit {

    /** Used as a helper to create the tab index for the element */
    public static NODE_COUNT = 0;

    /** Used so the node DOM element can be focused */
    public readonly nodeIndex: number = 0;

    @Input()
    public node: TreeNode;

    @Input()
    public level = 0;

    @Input()
    private preferenceKey;

    public isExpandable = false;

    public highlightedCharacterCount = new BehaviorSubject(0);

    public isExpanded = false;

    public isLoading = false;

    private isHighlighted = new BehaviorSubject(false);

    private nodeChildren;

    private nameParts: String[] = [];

    public el: Element;

    @ViewChild("nodeBase", {read: ElementRef})
    private nodeBase;

    @ViewChildren(TreeNodeComponent)
    private children: QueryList<TreeNodeComponent>;

    public constructor(private tree: TreeViewService,
                       private detector: ChangeDetectorRef,
                       private renderer: Renderer,
                       el: ElementRef) {

        super();

        this.nodeIndex = TreeNodeComponent.NODE_COUNT++;
        this.el = el.nativeElement;
    }

    ngOnInit() {

        this.isExpandable = typeof this.node.childrenProvider === "function";

        this.tracked = this.tree.selectedNode.map(node => node === this)
            .subscribe(isSelected => {

                this.isHighlighted.next(isSelected);

                // This element will lose focus in some cases so we need to refocus it
                // It would be unfocused when you click & select an element in a subtree, then arrow-navigate
                // upwards to its parent and close the parent using arrows. So this fixes that.
                if (isSelected) {
                    this.renderer.invokeElementMethod(this.nodeBase.nativeElement, "focus");
                }

            });

        this.nameParts = [this.node.name];

        this.tracked = this.highlightedCharacterCount.subscribe(charCount => {
            this.nameParts = [this.node.name];
            if (charCount > 0) {
                this.nameParts = [this.node.name.substr(0, charCount), this.node.name.substr(charCount)];
            }
            this.detector.markForCheck();
        });

        this.tree.addNode(this);

        if (this.preferenceKey) {
            this.tracked = this.tree.getExpandedNodes(this.preferenceKey).subscribe(values => {
                const found = values.find(value => this.node.id === value);
                if (found) {
                    // Parameter is false in order not to persist state whether node is expanded or collapsed
                    this.toggleExpansion();
                }
            });
        }
    }

    public toggleExpansion(persist = false) {

        this.isExpanded = !this.isExpanded;

        // Persist whether node is expanded or collapsed in local storage
        if (persist && this.preferenceKey) {
            this.persistToggleState(this.isExpanded);
        }

        if (this.isExpanded && !this.nodeChildren) {

            this.isLoading = true;
            this.tracked = this.node.childrenProvider(this.node).subscribe(children => {
                this.isLoading = false;
                this.nodeChildren = children;


                this.detector.markForCheck();
                this.detector.detectChanges();

            });
        }

        this.detector.markForCheck();
    }

    private persistToggleState(isExpanded: boolean) {
        isExpanded ? this.tree.saveToggleState(this.node.id, this.preferenceKey)
            : this.tree.deleteToggleState(this.node.id, this.preferenceKey);
    }

    public selectNode(event: MouseEvent) {
        this.tree.selectedNode.next(this);
    }

    public open() {
        if (!this.isExpanded) {
            this.toggle();
        }
    }

    public close() {
        if (this.isExpanded) {
            this.toggle();
        }
    }

    public toggle() {
        if (this.isExpandable) {
            this.toggleExpansion(true);
        } else if (typeof this.node.openHandler === "function") {
            const progress = this.node.openHandler(this.node);
            if (progress) {
                this.detector.markForCheck();
                progress.take(1).subscribe(_ => {
                    this.detector.markForCheck()
                });
            }
        }
    }

    private onClick(event: MouseEvent) {
        this.selectNode(event);
        this.tree.searchTerm.next("");
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.tree.removeNode(this, this.preferenceKey);
    }

    public getChildren(): QueryList<TreeNodeComponent> {
        return this.children;
    }

}
