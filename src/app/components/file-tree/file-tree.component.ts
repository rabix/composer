import {Component} from "@angular/core";
import "rxjs/Rx";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {TreeViewService} from "../tree-view/tree-view.service";
import {AsyncSocketProviderService} from "./async-socket-provider.service";

@Component({
    selector: "file-tree",
    template: `
        <tree-view [root]="node" [dataProvider]="dataProvider"></tree-view>
    `,
    directives: [TreeViewComponent],
    providers: [TreeViewService, AsyncSocketProviderService]
})
export class FileTreeComponent {

    private node;

    constructor(private dataProvider: AsyncSocketProviderService) {

        this.node = {
            name: "First",
            children: [
                {
                    name: "Second",
                    children: [
                        {name: "Mike"},
                        {name: "Josh"},
                    ]
                },
                {name: "Third"},
            ]
        };

    }


    ngOnInit() {
    }
}
