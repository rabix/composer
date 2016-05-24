import {Directive, Output} from "@angular/core";
import {TreeViewService} from "../tree-view.service";
import {BehaviorSubject} from "rxjs/Rx";

@Directive({
    selector: "[treeview-expandable]",
    host: {
        "(dblclick)": "toggleExpansion()",
        "class": "btn-sm clickable"
    }
})
export class TreeviewExpandableDirective {

    @Output() onExpansionSwitch = new BehaviorSubject<boolean>(false);

    constructor(private treeViewService: TreeViewService) {
    }

    toggleExpansion() {
        this.onExpansionSwitch.next(!this.onExpansionSwitch.getValue());
    }
}
