import {
    Component,
    Input,
    OnInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    QueryList,
    ViewChildren,
    ElementRef,
    Renderer,
    ViewChild
} from "@angular/core";
import {TreeNode} from "./types";
import {BehaviorSubject} from "rxjs";
import {TreeViewService} from "./tree-view.service";
import {ComponentBase} from "../common/component-base";

@Component({
    selector: "ct-tree-node",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div #nodeBase
             class="deep-unselectable clickable node-base"
             [style.paddingLeft.em]="level * 2"
             [attr.data-index]="nodeIndex"
             [tabindex]="nodeIndex"
             (click)="onClick($event)"
             [class.selected]="isHighlighted | async"
             (dblclick)="toggle()">
            
            <span *ngIf="node.icon" class="icon-space" (click)="toggle()">
                <i class="fa fa-fw" [ngClass]="getIconRules(node.icon)"></i>
            </span>
            
            <span *ngIf="node" class="name-container" [ct-context]="node.contextMenu" [title]="node.name">
                <span class="name" *ngFor="let namePart of nameParts">{{ namePart }}</span>
            </span>
            
            <span *ngIf="node.onClose" class="pull-right">
                <button type="button" class="text-primary btn-link no-underline-hover clickable" (click)="node.onClose()">&times;</button>
            </span>
        </div>
        
        <div *ngIf="isExpanded && nodeChildren" class="children">
            <ct-tree-node [level]="level + 1" *ngFor="let node of nodeChildren" [node]="node" [preferenceKey]="preferenceKey"></ct-tree-node>
            <div *ngIf="nodeChildren.length === 0">
                <span class="icon-space"></span>
                <i class="text-muted">empty </i>    
            </div>
        </div>
        
    `
})
export class TreeNodeComponent extends ComponentBase implements OnInit {

    public static NODE_COUNT = 0;

    @Input()
    public node: TreeNode;

    @Input()
    public level = 0;

    @Input()
    private preferenceKey;

    public isExpandable = false;

    public highlightedCharacterCount = new BehaviorSubject(0);

    public readonly nodeIndex = 0;

    private isExpanded = false;

    private isLoading = false;

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
            this.tree.getExpandedNodes(this.preferenceKey).subscribe(values => {
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
                progress.take(1).subscribe(_ => this.detector.markForCheck());
            }
        }
    }

    private getIconRules(icon) {

        const reserved = ["file", "folder", "angle", "loader", "Workflow", "CommandLineTool"];

        const predefs = {
            "fa-file": icon === "file",
            "fa-folder": icon === "folder" && !this.isExpanded,
            "fa-folder-open": icon === "folder" && this.isExpanded,
            "fa-angle-right": icon === "angle" && !this.isExpanded,
            "fa-angle-down": icon === "angle" && this.isExpanded,
            "fa-circle-o-notch fa-spin": this.isLoading || icon === "loader",
            "app-type-icon": ["CommandLineTool", "Workflow"].indexOf(icon) !== -1,
            "icon-command-line-tool": icon === "CommandLineTool",
            "icon-workflow": icon === "Workflow",
        };

        predefs[icon] = reserved.indexOf(icon) === -1;


        return predefs;
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
