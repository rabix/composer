import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {TreeNode} from "./types";
import {Observable} from "rxjs";

@Injectable()
export class TreeViewService {

    private highlightedNode: BehaviorSubject<TreeNode>;

    public searchTerm: BehaviorSubject<string>;


    constructor() {

        this.highlightedNode = new BehaviorSubject<TreeNode>(null);

        this.searchTerm = new BehaviorSubject("");

        Observable.fromEvent(document, "keydown")
            .filter((event: KeyboardEvent) => event.srcElement.classList.contains("node-base"))
            .do(ev => ev.preventDefault())
            .map(event => event.which)
            .scan((acc, key) => {
                const letter = String.fromCharCode(key).toLowerCase();

                if (key === 8) {
                    return acc.slice(0, -1);
                } else if (letter !== "") {
                    return acc + letter;
                }

            }, "")
            .distinctUntilChanged((a, b) => {
                return a == b;
            })
            .subscribe(this.searchTerm);
    }

    public highlight(node: TreeNode) {
        this.highlightedNode.next(node);
    }

    public isHighlighted(node: TreeNode) {
        return this.highlightedNode.map(highlighted => node === highlighted);
    }
}
