import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {TreeNodeComponent} from "./tree-node.component";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

@Injectable()
export class TreeViewService {

    public selectedNode = new BehaviorSubject<TreeNodeComponent>(null);

    public searchTerm = new BehaviorSubject("");

    public nodes = new Map();

    public highlightedNodes = new BehaviorSubject<TreeNodeComponent[]>([]);

    constructor(private preferences: UserPreferencesService) {

        this.observeNodesMatchingSearch().subscribe(this.highlightedNodes);

        this.observeFirstNodeMatchingSearch().subscribe(this.selectedNode);
    }

    private observeFirstNodeMatchingSearch() {
        return this.highlightedNodes.filter(arr => arr.length > 0).map(arr => arr[0]);
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

    public removeNode(treeNodeComponent: TreeNodeComponent, preferenceKey: string) {
        this.nodes.delete(treeNodeComponent.nodeIndex);
        if (preferenceKey) {
            this.deleteToggleState(treeNodeComponent.node.id, preferenceKey);
        }
    }

    public getExpandedNodes(key: string) {
        const lsKey = "expand-" + key;
        return this.preferences.get(lsKey, []).first();
    }

    public saveToggleState(id: string, key: string) {
        const lsKey = "expand-" + key;
        this.preferences.get(lsKey, []).first().subscribe(el => {
            this.preferences.put(lsKey, el.concat(id));
        });
    }

    public deleteToggleState(id: String, key: string) {
        const lsKey = "expand-" + key;
        this.preferences.get(lsKey, []).first().subscribe(el => {
            this.preferences.put(lsKey, el.filter(element => element !== id && !element.startsWith(id)));
        });
    }
}
