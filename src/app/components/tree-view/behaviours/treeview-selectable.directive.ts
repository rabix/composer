import {Directive} from "@angular/core";
import {TreeViewService} from "../tree-view.service";
@Directive({
    selector: "[treeview-selectable]",
    host: {
        "(click)": "highlight()",
        "[class.btn-primary]": "isHighlighted",
        "class": "btn-sm clickable"
    }
})
export class TreeviewSelectableDirective {

    private isHighlighted = false;

    constructor(private treeViewService: TreeViewService) {

        // When a new highlighted node comes through the stream, update the status of this one
        this.treeViewService.highlightedNode.subscribe(directiveReference => {
            this.isHighlighted = (directiveReference === this);
        });
    }

    highlight() {
        // Tell the others that this should be highlighted.
        this.treeViewService.highlightedNode.next(this);
    }
}
