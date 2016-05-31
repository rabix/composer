import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, Injector} from "@angular/core";
import {DataService} from "../../services/data/data.service";
import {DirectoryDataProviderFactory} from "./types";
import {FileTreeService} from "./file-tree.service";
import {TreeViewService, TreeViewComponent} from "../tree-view";

require("./file-tree.component.scss");

@Component({
    selector: "file-tree",
    directives: [TreeViewComponent, BlockLoaderComponent],
    providers: [TreeViewService, AsyncSocketProviderService, DataService],
    template: `
        <block-loader *ngIf="treeIsLoading"></block-loader>
        <tree-view [dataProvider]="dataProviderFn" 
                   [injector]="injector" 
                   (onDataLoad)="onDataLoad($event)"></tree-view>
    `
})
export class FileTreeComponent {

    private dataProviderFn: DirectoryDataProviderFactory;
    private treeIsLoading: boolean;

    constructor(private treeService: FileTreeService,
                private injector: Injector,
                private dataService: DataService) {

        this.treeIsLoading  = true;
        this.dataProviderFn = treeService.createDataProviderForDirectory("");

    }

    onDataLoad(data) {
        this.treeIsLoading = data === null;
    }
}
