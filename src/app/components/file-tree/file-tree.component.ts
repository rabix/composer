import {Component, Injector} from "@angular/core";
import "rxjs/Rx";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {TreeViewService} from "../tree-view/tree-view.service";
import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {FileTreeService} from "./file-tree-service";
import {ComponentLoaderComponent} from "../component-loader/component-loader.component";

require("./file-tree.component.scss");

@Component({
    selector: "file-tree",
    directives: [TreeViewComponent, ComponentLoaderComponent],
    providers: [TreeViewService, AsyncSocketProviderService, FileTreeService],
    template: `
        <component-loader *ngIf="treeIsLoading === true"></component-loader>
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
        console.log("Got loading data", data);
        this.treeIsLoading = data === null;
    }
}
