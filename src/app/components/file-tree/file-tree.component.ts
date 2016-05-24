import {Component, Injector} from "@angular/core";
import "rxjs/Rx";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {TreeViewService} from "../tree-view/tree-view.service";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {FileTreeService} from "./file-tree-service";

require("./file-tree.component.scss");

@Component({
    selector: "file-tree",
    template: `
        <tree-view [dataProvider]="dataProviderFn" [injector]="injector"></tree-view>
    `,
    directives: [TreeViewComponent],
    providers: [TreeViewService, AsyncSocketProviderService, FileTreeService]
})
export class FileTreeComponent {

    private dataProviderFn;

    constructor(private treeService: FileTreeService, private injector: Injector) {
        this.dataProviderFn = treeService.getDataProviderForDirectory("");
    }
}
