import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component} from "@angular/core";
import {DataService} from "../../services/data/data.service";
import {DirectoryDataProviderFactory} from "./types";
import {FileTreeService} from "./file-tree.service";
import {TreeViewService, TreeViewComponent} from "../tree-view";
import {NgTemplateOutlet} from "@angular/common";

@Component({
    selector: "file-tree",
    directives: [TreeViewComponent, BlockLoaderComponent, NgTemplateOutlet],
    providers: [TreeViewService, DataService],
    template: `
        <block-loader *ngIf="treeIsLoading"></block-loader>
        
        <tree-view class="deep-unselectable" 
                   [dataProvider]="dataProviderFn" 
                   (onDataLoad)="onDataLoad($event)"></tree-view>
    `
})
export class FileTreeComponent {

    private dataProviderFn: DirectoryDataProviderFactory;
    private treeIsLoading: boolean;

    constructor(private treeService: FileTreeService) {

        this.treeIsLoading  = true;
        this.dataProviderFn = treeService.createDataProviderForDirectory("");
    }


    onDataLoad(data) {
        this.treeIsLoading = data === null;
    }
}
