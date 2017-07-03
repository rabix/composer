import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {App} from "../../../../../electron/src/sbg-api-client/interfaces/app";

import {LocalFileRepositoryService} from "../../../file-repository/local-file-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {TreeViewComponent} from "../../../ui/tree-view/tree-view.component";
import {TreeViewService} from "../../../ui/tree-view/tree-view.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {TabData} from "../../workbox/tab-data.interface";
import {WorkboxService} from "../../workbox/workbox.service";
import {NavSearchResultComponent} from "../nav-search-result/nav-search-result.component";
import {PublicAppsPanelService} from "./public-apps-panel.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";

@Component({
    selector: "ct-public-apps-panel",
    template: `
        <ct-search-field class="m-1" [formControl]="searchContent"
                         [placeholder]="'Search Public Apps...'"></ct-search-field>

        <div class="btn-group grouping-toggle" *ngIf="!searchContent?.value">
            <button type="button"
                    [class.active]="grouping === 'toolkit'"
                    (click)="switchGrouping('toolkit')"
                    class="btn btn-secondary">By Toolkit
            </button>

            <button type="button"
                    (click)="switchGrouping('category')"
                    [class.active]="grouping === 'category'"
                    class="btn btn-secondary">By Category
            </button>
        </div>

        <div class="scroll-container">

            <div *ngIf="searchContent?.value && searchResults" class="search-results">
                <ct-nav-search-result *ngFor="let entry of searchResults" class="pl-1 pr-1"
                                      [id]="entry?.id"
                                      [icon]="entry?.icon"
                                      [label]="entry?.label"
                                      [title]="entry?.title"

                                      [tabData]="entry?.tabData"

                                      [ct-drag-enabled]="entry?.dragEnabled"
                                      [ct-drag-transfer-data]="entry?.dragTransferData"
                                      [ct-drag-image-caption]="entry?.dragLabel"
                                      [ct-drag-image-class]="entry?.dragImageClass"
                                      [ct-drop-zones]="entry?.dragDropZones"

                                      (dblclick)="openSearchResult(entry)"></ct-nav-search-result>
            </div>
            <ct-line-loader class="m-1"
                            *ngIf="searchContent.value 
                             && !searchResults"></ct-line-loader>

            <div *ngIf="searchContent.value 
                        && (searchResults && searchResults?.length === 0)"
                 class="no-results m-1">
                <p class="explanation">
                    No search results for “{{ searchContent.value }}.”
                </p>
                <i class="icon fa-4x fa fa-search"></i>
            </div>

            <ct-tree-view #tree
                          [level]="1"
                          [class.hidden]="searchContent?.value"
                          [nodes]="grouping === 'toolkit' ? (appsByToolkit | async) : (appsByCategory | async)"></ct-tree-view>
        </div>
    `,
    providers: [LocalFileRepositoryService, PublicAppsPanelService],
    styleUrls: ["./public-apps-panel.component.scss"]
})
export class PublicAppsPanelComponent extends DirectiveBase implements OnInit, AfterViewInit {

    treeNodes: TreeNode<any>[] = [];

    searchContent = new FormControl();

    searchResults = undefined;

    expandedNodes;

    groupedNodes: TreeNode<any>[];

    grouping: "category" | "toolkit" | string = "toolkit";

    @ViewChild(TreeViewComponent)
    treeComponent: TreeViewComponent;

    @ViewChildren(NavSearchResultComponent, {read: ElementRef})
    private searchResultComponents: QueryList<ElementRef>;

    private tree: TreeViewService;

    appsByToolkit: Observable<TreeNode<any>[]>;
    appsByCategory: Observable<TreeNode<any>[]>;

    constructor(private workbox: WorkboxService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService,
                private service: PublicAppsPanelService) {
        super();


        this.appsByToolkit  = this.service.getAppsGroupedByToolkit();
        this.appsByCategory = this.service.getAppsGroupedByCategory();
    }

    ngOnInit() {

        this.localRepository.getPublicAppsGrouping().take(1).subscribeTracked(this, (grouping) =>{
            this.grouping = grouping;
        });

    }

    ngAfterViewInit() {

        this.tree = this.treeComponent.getService();

        this.listenForAppOpening();

        this.attachSearchObserver();

        this.attachExpansionStateSaving();

        this.searchResultComponents.changes.subscribeTracked(this, list => {
            list.forEach((el, idx) => setTimeout(() => el.nativeElement.classList.add("shown"), idx * 20));
        });
    }

    switchGrouping(type: "toolkit" | "category") {
        this.grouping = type;

        this.localRepository.setPublicAppsGrouping(type);
    }

    private search(term): Observable<any[]> {
        return this.platformRepository.searchPublicApps(term).map(apps => {
            return apps.map(app => {

                return {
                    id: app.id,
                    icon: app.raw["class"] === "Workflow" ? "fa-share-alt" : "fa-terminal",
                    title: app.name,
                    label: app.id.split("/").join(" → "),
                    relevance: 1.5,

                    tabData: {
                        id: app.id,
                        isWritable: false,
                        label: app.name,
                        language: "json",
                        type: app.raw["class"],
                    } as TabData<any>,

                    dragEnabled: true,
                    dragTransferData: app.id,
                    dragLabel: app.name,
                    dragImageClass: app.raw["class"] === "CommandLineTool" ? "icon-command-line-tool" : "icon-workflow",
                    dragDropZones: ["zone1"]
                }
            });
        });
    }


    private attachSearchObserver() {

        const searchValueChanges = this.searchContent.valueChanges;

        searchValueChanges
            .subscribeTracked(this, () => this.searchResults = undefined);

        searchValueChanges
            .debounceTime(250)
            .filter(term => term.trim().length !== 0)
            .switchMap(term => this.search(term))
            .subscribe(results => {
                this.searchResults = results;
            });
    }

    private attachExpansionStateSaving() {

        this.tree.expansionChanges.subscribeTracked(this, (node) => {
            const state = node.getExpansionState();
            this.platformRepository.setNodeExpansion(node.id, state);
        });
    }


    private listenForAppOpening() {

        const appOpening = this.tree.open.filter(n => n.type === "app");

        appOpening.subscribeTracked(this, (node: TreeNode<App>) => {
            const app = node.data;
            if (!app.raw || !app.raw.class) {
                return;
            }

            const tab = this.workbox.getOrCreateAppTab({
                id: app.id,
                language: "json",
                isWritable: false,
                type: app.raw.class,
                label: app.name
            });

            this.workbox.openTab(tab);
        });
    }

    openSearchResult(entry: NavSearchResultComponent) {
        const tab = this.workbox.getOrCreateAppTab(entry.tabData);
        this.workbox.openTab(tab);
    }
}
