import {Component, Injector} from "@angular/core";
import "rxjs/Rx";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {TreeViewService} from "../tree-view/tree-view.service";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {FileTreeService} from "./file-tree-service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";

require("./file-tree.component.scss");

@Component({
    selector: "file-tree",
    directives: [TreeViewComponent, BlockLoaderComponent],
    providers: [TreeViewService, AsyncSocketProviderService],
    template: `
        <block-loader *ngIf="treeIsLoading === true"></block-loader>
        <tree-view [dataProvider]="dataProviderFn" 
                   [injector]="injector" 
                   (onDataLoad)="onDataLoad($event)"></tree-view>
    `
})
export class FileTreeComponent {

    private dataProviderFn;
    private treeIsLoading = true;

    constructor(private treeService: FileTreeService, private injector: Injector) {
        this.dataProviderFn = treeService.getDataProviderForDirectory("");
    }

    onDataLoad(data) {
        this.treeIsLoading = data === null;
    }
}
