import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, provide} from "@angular/core";
import {DataService} from "../../services/data/data.service";
import {DirectoryDataProviderFactory} from "./types";
import {EventMonitors} from "../../services/api/event-monitor.service";
import {FileTreeService} from "./file-tree.service";
import {TreeViewService, TreeViewComponent} from "../tree-view";

@Component({
    selector: "file-tree",
    directives: [TreeViewComponent, BlockLoaderComponent],
    providers: [
        TreeViewService,
        DataService,
        provide(EventMonitors, {
            useValue: "hello World",
            multi: true
        })],
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

    constructor(private treeService: FileTreeService, monitors: EventMonitors) {

        this.treeIsLoading  = true;
        this.dataProviderFn = treeService.createDataProviderForDirectory("");
    }


    onDataLoad(data) {
        this.treeIsLoading = data === null;
    }
}
