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
            .filter((event: KeyboardEvent) => {
                return (event.keyCode > 47 && event.keyCode < 58) || // number keys
                    (event.keyCode == 32 || event.keyCode == 8) || // spacebar & backspace
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
            .distinctUntilChanged((a, b) => a == b)
            .subscribe(this.searchTerm);
    }

    public highlight(node: TreeNode) {
        this.highlightedNode.next(node);
    }

    public isHighlighted(node: TreeNode) {
        return this.highlightedNode.map(highlighted => node === highlighted);
    }
}
