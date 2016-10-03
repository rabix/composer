import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {TreeNodeComponent} from "./tree-node.component";

@Injectable()
export class TreeViewService {

    public selectedNode = new BehaviorSubject<TreeNodeComponent>(null);

    public searchTerm = new BehaviorSubject("");

    public nodes = new Map();

    public highlightedNodes = new BehaviorSubject<TreeNodeComponent[]>([]);

    constructor() {

        this.observeNodesMatchingSearch().subscribe(this.highlightedNodes);

        this.observeFirstNodeMatchingSearch().subscribe(this.selectedNode);
    }

    private observeFirstNodeMatchingSearch() {
        return this.highlightedNodes.filter(arr => arr.length).map(arr => arr[0]);
    }

    private observeNodesMatchingSearch() {
        return this.searchTerm.map(term => {
            const matchingNodes = [];

            this.nodes.forEach((n: TreeNodeComponent) => {
                let matchingCharacters = 0;
                if (n.node.name.toLowerCase().indexOf(term.toLowerCase()) === 0) {
                    matchingCharacters = term.length;
                }

                if (matchingCharacters !== n.highlightedCharacterCount.getValue()) {
                    n.highlightedCharacterCount.next(matchingCharacters);
                }

                if (matchingCharacters > 0) {
                    matchingNodes.push(n);
                }
            });

            return matchingNodes;
        });
    }

    public addNode(node: TreeNodeComponent) {
        this.nodes.set(node.nodeIndex, node);
    }

    public removeNode(node: TreeNodeComponent) {
        this.nodes.delete(node.nodeIndex);
    }


}
