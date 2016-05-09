import {Component, Input} from "@angular/core";

@Component({
    selector: "tree-element",
    template: `
        <ul>
            <li *ngFor="let item of items" children="item.children">Thing: {{ item.name }}</li>
        </ul>
    `
})
export class TreeElementComponent {

    @Input()
    private items: TreeChild[];
}


interface TreeChild {
    name: string;
    children: TreeChild[];
}
