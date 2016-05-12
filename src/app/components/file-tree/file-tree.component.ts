import {Component} from "@angular/core";
import "rxjs/Rx";

@Component({
    selector: "file-tree",
    template: `
        <h2>Hello, File Tree!</h2>
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
