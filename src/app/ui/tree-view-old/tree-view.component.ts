// import {
//     ChangeDetectionStrategy,
//     Component,
//     ElementRef,
//     Input,
//     QueryList,
//     ViewChildren,
//     ViewEncapsulation
// } from "@angular/core";
// import {Observable} from "rxjs";
// import {DomEventService} from "../../services/dom/dom-event.service";
// import {DirectiveBase} from "../../util/directive-base/directive-base";
// import {TreeNodeComponent} from "./tree-node.component";
// import {TreeViewService} from "./tree-view.service";
// import {TreeNode} from "./types";
//
// @Component({
//     encapsulation: ViewEncapsulation.None,
//
//     selector: "ct-tree-view",
//     styleUrls: ["./tree-view.component.scss"],
//     changeDetection: ChangeDetectionStrategy.OnPush,
//     providers: [TreeViewService],
//     template: `
//         <div class="search-term-container" *ngIf="searchTerm.length > 0">
//             <div class="search-term">
//                 Matching: <span class="term">"{{ searchTerm }}"</span>
//             </div>
//
//         </div>
//
//         <div [class.m-t-2]="searchTerm.length > 0">
//             <ct-tree-node class="root-node" *ngFor="let node of nodes" [node]="node"
//                           [preferenceKey]="preferenceKey"></ct-tree-node>
//         </div>
//     `
// })
// export class TreeViewComponent extends DirectiveBase {
//
//     @Input()
//     public nodes: TreeNode[];
//
//     @Input()
//     public preferenceKey;
//
//     private el: Element;
//
//     private searchTerm = "";
//
//     @ViewChildren(TreeNodeComponent)
//     private treeNodes: QueryList<TreeNodeComponent>;
//
//     constructor(private tree: TreeViewService, private domEvents: DomEventService, el: ElementRef) {
//         super();
//
//         this.tree.searchTerm.subscribe(term => {
//             this.searchTerm = term;
//         });
//
//         this.el      = el.nativeElement;
//         //
//         this.tracked = this.observeArrowNavigation().withLatestFrom(
//             this.tree.selectedNode.filter(n => !!n),
//             (dir, node) => ({dir, node}))
//             .subscribe((data) => {
//
//                 // Get all nodes underneath this tree as dom elements
//                 const domNodes = (Array.from(document.getElementsByClassName("node-base")) as Element[])
//                     .filter((el: Element) => this.el === el || this.el.contains(el));
//
//                 // Find the currently selected element within
//                 const selected = domNodes.findIndex((el: Element) => el.classList.contains("selected"));
//
//                 // Determine which node is to be selected next, depending on the keystroke
//                 const nextNode: Element = data.dir === "up" ? domNodes[selected - 1] : domNodes[selected + 1];
//
//                 // If there's no previous or next node, nothing should be done
//                 if (!nextNode) {
//                     return;
//                 }
//
//                 // Take all top-level tree-node components
//                 const treeNodes: Array<TreeNodeComponent> = this.treeNodes.toArray();
//
//                 // Recursively find all their children
//
//                 const expand = nodes =>
//                     nodes.reduce((acc, node) => acc.concat(node, expand(node.getChildren().toArray())), []);
//                 const next   = expand(treeNodes).find(node => node.nodeIndex == nextNode.getAttribute("data-index"));
//
//                 // Select the component that matches the index
//                 this.tree.selectedNode.next(next);
//             });
//
//
//         this.tracked = this.observeArrowToggling()
//             .withLatestFrom(this.tree.selectedNode, (action, node) => ({action, node}))
//             .subscribe(data => data.action === "open" ? data.node.open() : data.node.close());
//
//
//         this.tracked = this.captureSearchTerm().subscribe(tree.searchTerm);
//
//         this.tracked = this.observeNodeOpening()
//             .subscribe(node => {
//                 node.toggle();
//                 this.tree.searchTerm.next("");
//             });
//
//
//         this.tracked = this.tree.selectedNode.filter(c => !!c)
//             .map(comp => comp.el.querySelector(".node-base")).subscribe(el => {
//                 const nodeRect       = el.getBoundingClientRect();
//                 const treeRect       = this.el.getBoundingClientRect();
//                 const nodeFromAbove  = nodeRect.top - treeRect.top;
//                 const nodeFromBelow  = treeRect.height - nodeFromAbove - nodeRect.height;
//                 const isAboveTheFold = nodeFromAbove < 0;
//                 const isBelowTheFold = nodeFromBelow < 0;
//
//                 if (isAboveTheFold) {
//                     this.el.scrollTop += nodeFromAbove;
//                 } else if (isBelowTheFold) {
//                     this.el.scrollTop -= nodeFromBelow;
//                 }
//             });
//     }
//
//     private captureSearchTerm(): Observable<string> {
//         return this.domEvents.on("keydown", this.el, true)
//             .filter((event: KeyboardEvent) => {
//                 if (event.ctrlKey || event.altKey || event.metaKey) {
//                     return false;
//                 }
//
//                 return (event.keyCode > 47 && event.keyCode < 58) || // number keys
//                     ([32, 8, 27].indexOf(event.keyCode) !== -1) ||
//                     (event.keyCode > 64 && event.keyCode < 91) || // letter keys
//                     (event.keyCode > 95 && event.keyCode < 112) || // numpad keys
//                     (event.keyCode > 185 && event.keyCode < 193) || // ;=,-./` (in order)
//                     (event.keyCode > 218 && event.keyCode < 223);
//             })
//             .withLatestFrom(this.tree.searchTerm, (event: KeyboardEvent, latestTerm: string) => {
//
//                 if (event.which === 8) {
//                     return latestTerm.slice(0, -1);
//                 } else if (event.which === 27) {
//                     return "";
//                 }
//                 return latestTerm + event.key;
//             })
//             .distinctUntilChanged((a, b) => a == b);
//     }
//
//     private observeArrowToggling(): Observable<"close" | "open"> {
//
//         return this.domEvents.on("keydown", this.el)
//             .filter((ev: KeyboardEvent) => [37, 39].indexOf(ev.keyCode) !== -1)
//             .map((ev: KeyboardEvent) => ev.keyCode === 37 ? "close" : "open");
//     }
//
//     private observeArrowNavigation(): Observable<"up" | "down"> {
//
//         return this.domEvents.on("keydown", this.el)
//             .filter((ev: KeyboardEvent) => [38, 40].indexOf(ev.keyCode) !== -1)
//             .map((ev: KeyboardEvent) => ev.keyCode === 38 ? "up" : "down");
//     }
//
//     private observeNodeOpening() {
//         return this.domEvents.on("keyup", this.el)
//             .filter((ev: KeyboardEvent) => ev.keyCode === 13)
//             .flatMap(_ => this.tree.selectedNode.first())
//             .filter(n => !!n);
//     }
// }
