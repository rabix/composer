import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, ChangeDetectionStrategy, Input, ViewChildren, QueryList} from "@angular/core";
import {TreeNode} from "./types";
import {TreeNodeComponent} from "./tree-node.component";
import {TreeViewService} from "./tree-view.service";

require("./tree-view.component.scss");

@Component({
    selector: "ct-tree-view",
    directives: [BlockLoaderComponent, TreeNodeComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TreeViewService],
    template: `
        <div [ngClass]="{'hidden': searchTerm.length === 0}" class="search-term">
            Matching: <span class="term">"{{ tree.searchTerm | async }}"</span>
        </div>
        <ct-tree-node *ngFor="let node of nodes" [node]="node"></ct-tree-node>
    `
})
export class TreeViewComponent {

    @Input()
    public nodes: TreeNode[];

    @ViewChildren(TreeNodeComponent, {descendants: true})
    private children: QueryList<TreeNodeComponent>;

    private searchTerm = "";

    private subs = [];

    constructor(private tree: TreeViewService) {

        this.subs.push(tree.searchTerm.subscribe(term => {
            this.searchTerm = term;
        }));
    }

    ngAfterViewInit(){
        this.children.changes.subscribe(ch => {
        });
    }



    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
