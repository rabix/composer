import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, ChangeDetectionStrategy, Input, ElementRef, QueryList, ViewChildren} from "@angular/core";
import {TreeNode} from "./types";
import {TreeNodeComponent} from "./tree-node.component";
import {TreeViewService} from "./tree-view.service";
import {DomEventService} from "../../services/dom/dom-event.service";
import {Observable} from "rxjs";

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

    private searchTerm = "";

    private subs = [];

    private el: Element;

    @ViewChildren(TreeNodeComponent)
    private treeNodes: QueryList<TreeNodeComponent>;

    constructor(private tree: TreeViewService, el: ElementRef, private domEvents: DomEventService) {
        this.el = el.nativeElement;
        this.subs.push(tree.searchTerm.subscribe(term => {
            this.searchTerm = term;
        }));

        this.observeArrowNavigation().withLatestFrom(
            this.tree.selectedNode.filter(n => n),
            (dir, node) => ({dir, node}))
            .subscribe((data) => {

                // Get all nodes underneath this tree as dom elements
                const domNodes = (Array.from(document.getElementsByClassName("node-base")) as Array)
                    .filter((el: Element) => this.el === el || this.el.contains(el));

                // Find the currently selected element within
                const selected = domNodes.findIndex((el: Element) => el.classList.contains("selected"));

                // Determine which node is to be selected next, depending on the keystroke
                const nextNode: Element = data.dir === "up" ? domNodes[selected - 1] : domNodes[selected + 1];

                // If there's no previous or next node, nothing should be done
                if (!nextNode) {
                    return;
                }

                // Take all top-level tree-node components
                const treeNodes = this.treeNodes.toArray();

                // Recursively find all their children
                const next = [].concat.apply(treeNodes, treeNodes.map(node => node.getChildren().toArray()))
                    .find(node => node.nodeIndex == nextNode.getAttribute("data-index"));

                // Select the component that matches the index
                this.tree.selectedNode.next(next);
            });

        this.observeArrowToggling().withLatestFrom(this.tree.selectedNode, (action, node) => ({action, node}))
            .subscribe(data => data.action === "open" ? data.node.open() : data.node.close());

        this.observeSearchTerm().subscribe(tree.searchTerm);

        this.observeNodeOpening().subscribe(node => {
            node.toggle();
            this.tree.searchTerm.next("");
        });

    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    private observeSearchTerm(): Observable<string> {
        return this.domEvents.on("keydown", this.el, true)
            .filter((event: KeyboardEvent) => {
                return (event.keyCode > 47 && event.keyCode < 58) || // number keys
                    ([32, 8].indexOf(event.keyCode) !== -1) || // enter, spacebar & backspace
                    (event.keyCode > 64 && event.keyCode < 91) || // letter keys
                    (event.keyCode > 95 && event.keyCode < 112) || // numpad keys
                    (event.keyCode > 185 && event.keyCode < 193) || // ;=,-./` (in order)
                    (event.keyCode > 218 && event.keyCode < 223);
            })
            .scan((acc, event: KeyboardEvent) => {
                if (event.which === 8) {
                    return acc.slice(0, -1);
                }
                return acc + event.key;
            }, "")
            .distinctUntilChanged((a, b) => a == b);
    }

    private observeArrowToggling(): Observable<"close"|"open"> {

        return this.domEvents.on("keydown", this.el)
            .filter(ev => [37, 39].indexOf(ev.keyCode) !== -1)
            .map((ev: KeyboardEvent) => ev.keyCode === 37 ? "close" : "open");
    }

    private observeArrowNavigation(): Observable<"up"|"down"> {

        return this.domEvents.on("keydown", this.el)
            .filter(ev => [38, 40].indexOf(ev.keyCode) !== -1)
            .map((ev: KeyboardEvent) => ev.keyCode === 38 ? "up" : "down");
    }

    private observeNodeOpening() {
        return this.domEvents.on("keyup", this.el)
            .filter(ev => ev.keyCode === 13)
            .flatMap(_ => this.tree.selectedNode.first())
            .filter(n => n);
    }
}
