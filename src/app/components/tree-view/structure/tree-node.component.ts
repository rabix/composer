import {Component, Input, Output} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {TreeViewService} from "../tree-view.service";

@Component({
    selector: "tree-node",
    host: {
        "(click)": "highlight()",
        "(dblclick)": "toggleExpansion()",
        "[class.btn-primary]": "isHighlighted",
        "class": "btn-sm"
    },
    template: `
        
        <template [ngIf]="isExpandable">
            <span [ngClass]="{'fa-angle-right': !isExpanded, 'fa-angle-down': isExpanded}"
                  class="expander fa">
            </span>
        </template>
        
        <span>
            {{ node.name }}
        </span>
    `
})
export class TreeNodeComponent {

    @Input() node;
    @Output() expansionSwitch = new BehaviorSubject<boolean>(false);

    private isExpanded    = false;
    private isExpandable  = false;
    private isHighlighted = false;

    constructor(private treeViewService: TreeViewService) {

        this.treeViewService.highlightedNode.subscribe((node) => {
            this.isHighlighted = (node === this);
        });
    }

    highlight() {
        this.treeViewService.highlightedNode.next(this);
    }

    toggleExpansion() {
        this.isExpanded = !this.isExpanded;
        this.expansionSwitch.next(this.isExpanded);
    }

    ngOnInit() {

        // this.dataProvider.getDirContent().subscribe((data) => {
        //     console.log("provided data", data);
        // });

        this.isExpandable = this.node.children && this.node.children.length > 0;


    }
}
