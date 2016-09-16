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
                console.debug("Code:", key);

                if (key === 8) {
                    console.debug("Slicing");
                    return acc.slice(0, -1);
                } else if (letter !== "") {
                    console.debug("Adding", letter.length, letter);
                    return acc + letter;
                }

            }, "")
            .distinctUntilChanged((a, b) => {
                console.debug("Are same?", a == b);
                return a == b;
            })
            .subscribe(this.searchTerm);

        this.searchTerm.subscribe(term => {
            console.debug("Searching:", term);
        });
    }

    public highlight(node: TreeNode) {
        this.highlightedNode.next(node);
    }

    public isHighlighted(node: TreeNode) {
        return this.highlightedNode.map(highlighted => node === highlighted);
    }

    public searchKeypress(event: KeyboardEvent) {

    }
}
