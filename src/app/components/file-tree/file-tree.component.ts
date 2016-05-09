import {Component} from "@angular/core";
import "rxjs/Rx";

@Component({
    selector: "file-tree",
    template: `
        <tree-element *ngFor="let item of items"></tree-element>
    `
})
export class FileTreeComponent {

    private items;

    constructor() {

        this.items = [
            {
                name: 'First.txt',
                type: 'file',
                children: [],
            }, {
                name: 'Second',
                type: 'directory',
                children: []
            }
        ];

    }


    ngOnInit() {

    }
}
