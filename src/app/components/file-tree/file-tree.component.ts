import {AsyncSocketProviderService} from "./async-socket-provider.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {Component, Injector} from "@angular/core";
import {DataService} from "../../services/data/data.service";
import {DirectoryDataProviderFactory} from "./types";
import {FileTreeService} from "./file-tree.service";
import {TreeViewService, TreeViewComponent} from "../tree-view";
import {FileEffects} from "../../store/effects/file.effects";
import {Store} from "@ngrx/store";
import * as STORE_ACTIONS from "../../store/actions";
import {NgTemplateOutlet} from "@angular/common";

require("./file-tree.component.scss");

@Component({
    selector: "file-tree",
    directives: [TreeViewComponent, BlockLoaderComponent, NgTemplateOutlet],
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

    private storeSubscription;

    constructor(private treeService: FileTreeService,
                private injector: Injector,
                private store: Store,
                private fileEffects: FileEffects) {

        this.treeIsLoading  = true;
        this.dataProviderFn = treeService.createDataProviderForDirectory("");
    }

    ngOnInit() {
        // We need to react to changes on the directory structure and update the tree
        this.storeSubscription = this.fileEffects.directoryContent$.subscribe(this.store);

        // Upon the change in the directory tree, we should update the rendering
        this.store.select("directoryTree").subscribe(tree => {
            console.log("New Tree Structure:", tree);
        });

        // This is the main user of the directory structure, it should dispatch the first request
        this.store.dispatch({type: STORE_ACTIONS.DIR_CONTENT_REQUEST, payload: "./"});

    }

    ngOnDestroy() {
        this.storeSubscription.unsubscribe();
    }

    onDataLoad(data) {
        this.treeIsLoading = data === null;
    }
}
