import {Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from "@angular/core";
import {ContextDirective} from "../../services/context/context.directive";
import {TreeNode} from "./types";
import {Observable} from "rxjs";
import {TreeViewService} from "./tree-view.service";


@Component({
    selector: "ct-tree-node",
    directives: [ContextDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="deep-unselectable clickable main"
             [tabindex]="nodeIndex"
             (click)="selectNode($event)"
             [class.selected]="isHighlighted | async"
             (dblclick)="onDoubleClick()">
            
            <span *ngIf="node.icon" class="icon-space">
                <i class="fa fa-fw" [ngClass]="getIconRules()"></i>
            </span>
            
            <span *ngIf="node" class="name-container">
                <span class="name" *ngFor="let namePart of nameParts">{{ namePart }}</span>
            </span>
            
            
        </div>
        
        <div *ngIf="isExpanded" class="children">
            <ct-tree-node *ngFor="let node of (nodeChildren | async)" [node]="node"></ct-tree-node>
            <div *ngIf="(nodeChildren | async)?.length === 0">
                <span class="icon-space"></span>
                <i class="text-muted">empty </i>    
            </div>
        </div>
        
    `
})
export class TreeNodeComponent implements OnInit {

    public static NODE_COUNT = 0;

    @Input()
    public node: TreeNode;

    public isExpandable = false;

    private isExpanded = false;

    private isLoading = false;

    private isHighlighted: Observable<boolean>;

    private nodeChildren: Observable<TreeNode[]>;

    private nodeIndex = 0;

    private highlightCount = 0;

    private nameParts: String[] = [];

    public constructor(private tree: TreeViewService, private detector: ChangeDetectorRef) {

        this.nodeIndex = TreeNodeComponent.NODE_COUNT++;
    }

    ngOnInit() {

        this.isExpandable  = typeof this.node.childrenProvider === "function";
        this.isHighlighted = this.tree.isHighlighted(this.node);

        this.nameParts = [this.node.name];

        this.tree.searchTerm.subscribe(term => {
            let count = 0;

            if (this.node.name.toLowerCase().indexOf(term.toLowerCase()) === 0) {
                count = term.length;
            }

            if (count !== this.highlightCount) {
                this.highlightCount = count;

                this.nameParts = [this.node.name];
                if (count > 0) {
                    this.nameParts = [this.node.name.substr(0, count), this.node.name.substr(count)];
                }

            }
            this.detector.markForCheck();
        });
    }

    public toggleExpansion() {
        this.isExpanded = !this.isExpanded;

        if (this.isExpanded && !this.nodeChildren) {
            this.nodeChildren = this.node.childrenProvider(this.node);
        }

        this.isLoading = true;
        this.nodeChildren.first().subscribe(_ => this.isLoading = false);
    }

    public selectNode(event: MouseEvent) {
        this.tree.highlight(this.node);
    }

    private onDoubleClick() {
        if (this.isExpandable) {
            this.toggleExpansion();
        } else if (typeof this.node.openHandler === "function") {
            const progress = this.node.openHandler(this.node);
            if (progress) {
                progress.add(_ => this.detector.markForCheck());
            }
        }
    }

    private getIconRules() {
        const rules = {
            "fa-file": this.node.icon === "file",
            "fa-folder": this.node.icon === "folder" && !this.isExpanded,
            "fa-folder-open": this.node.icon === "folder" && this.isExpanded,
            "fa-angle-right": this.node.icon === "angle" && !this.isExpanded,
            "fa-angle-down": this.node.icon === "angle" && this.isExpanded,
            "fa-circle-o-notch fa-spin": this.isLoading || this.node.icon === "loader",
            "app-type-icon": ["CommandLineTool", "Workflow"].indexOf(this.node.icon) !== -1,
            "icon-command-line-tool": this.node.icon === "CommandLineTool",
            "icon-workflow": this.node.icon === "Workflow",
        };

        return rules;
    }
}
