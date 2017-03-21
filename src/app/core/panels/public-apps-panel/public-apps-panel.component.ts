import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {FormControl} from "@angular/forms";

import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";

import {LocalFileRepositoryService} from "../../../file-repository/local-file-repository.service";
import {PlatformAPI} from "../../../services/api/platforms/platform-api.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {TreeViewComponent} from "../../../ui/tree-view/tree-view.component";
import {TreeViewService} from "../../../ui/tree-view/tree-view.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {PlatformAppEntry} from "../../data-gateway/data-types/platform-api.types";
import {WorkboxService} from "../../workbox/workbox.service";
import {NavSearchResultComponent} from "../nav-search-result/nav-search-result.component";
import Platform = NodeJS.Platform;

@Component({
    selector: "ct-public-apps-panel",
    template: `
        <ct-search-field class="m-1" [formControl]="searchContent" [placeholder]="'Search Public Apps...'"></ct-search-field>

        <div class="btn-group grouping-toggle" *ngIf="!searchContent?.value">
            <button type="button"
                    (click)="regroup('toolkit')"
                    [class.active]="grouping === 'toolkit'"
                    class="btn btn-sm btn-secondary">By Toolkit
            </button>

            <button type="button"
                    (click)="regroup('category')"
                    [class.active]="grouping === 'category'"
                    class="btn btn-sm btn-secondary">By Category
            </button>
        </div>

        <div class="scroll-container">

            <div *ngIf="searchContent?.value && searchResults" class="search-results">
                <ct-nav-search-result *ngFor="let entry of searchResults"
                                      class="pl-1 pr-1"
                                      [title]="entry?.title"
                                      [icon]="entry?.icon"
                                      (dblclick)="entry.open()"
                                      [label]="entry?.label">
                </ct-nav-search-result>
            </div>
            <ct-block-loader class="m-1"
                             *ngIf="searchContent.value 
                             && searchContent.value !== appliedSearchTerm 
                             && !searchResults"></ct-block-loader>

            <div *ngIf="searchContent.value 
                        && searchContent.value === appliedSearchTerm 
                        && (searchResults && searchResults.length === 0)"
                 class="no-results m-1">
                <p class="explanation">
                    No search results for “{{ searchContent.value }}.”
                </p>
                <i class="icon fa-4x fa fa-search"></i>
            </div>

            <ct-tree-view #tree [hidden]="searchContent?.value" [nodes]="groupedNodes" [level]="1"></ct-tree-view>
        </div>
    `,
    providers: [TreeViewService, LocalFileRepositoryService],
    styleUrls: ["./public-apps-panel.component.scss"]
})
export class PublicAppsPanelComponent extends DirectiveBase implements AfterViewInit {

    treeNodes: TreeNode<any>[];

    searchContent = new FormControl();

    searchResults = undefined;

    appliedSearchTerm: string;

    expandedNodes;

    groupedNodes: TreeNode<any>[];

    grouping: "category" | "toolkit" | string;

    @ViewChild(TreeViewComponent)
    treeComponent: TreeViewComponent;

    @ViewChildren(NavSearchResultComponent, {read: ElementRef})
    private searchResultComponents: QueryList<ElementRef>;

    constructor(private tree: TreeViewService,
                private preferences: UserPreferencesService,
                private platform: PlatformAPI,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private dataGateway: DataGatewayService) {
        super();

        this.expandedNodes = this.preferences.get("expandedNodes", []).take(1).publishReplay(1).refCount();

        this.loadDataSources();
        this.attachSearchObserver();
        this.attachExpansionStateSaving();

        this.listenForAppOpening();

        this.tracked = this.preferences.get("publicAppsGrouping", "toolkit").subscribe(grouping => {
            this.grouping = grouping;
        });
    }

    ngAfterViewInit() {

        this.searchResultComponents.changes.subscribe(list => {
            list.forEach((el, idx) => setTimeout(() => el.nativeElement.classList.add("shown"), idx * 20));
        });
    }

    regroup(groupBy, force = false) {
        if (groupBy === this.grouping && !force) {
            return;
        }
        this.preferences.put("publicAppsGrouping", groupBy);

        this.expandedNodes.take(1).subscribe(expanded => {
            if (groupBy === "toolkit") {
                this.groupedNodes = this.groupByToolkit(this.treeNodes, expanded);
            } else {
                this.groupedNodes = this.groupByCategory(this.treeNodes, expanded);
            }
        });
    }

    private groupByToolkit(nodes: { data?: PlatformAppEntry }[], expandedNodes: string[] = []) {

        const groups = nodes.reduce((acc, node: TreeNode<PlatformAppEntry>) => {
            const groupKey = (node.data["sbg:toolkit"] + " " + node.data["sbg:toolkitVersion"]).trim();

            if (!acc[groupKey]) {
                const id      = "__toolkit/" + groupKey;
                acc[groupKey] = {
                    id,
                    label: groupKey,
                    isExpandable: true,
                    isExpanded: expandedNodes.indexOf(id) !== -1,
                    type: "toolkit",
                    children: [],
                    icon: "fa-folder"
                };
            }
            acc[groupKey].children.push(node);

            return acc;
        }, {});


        const sortedGroup = Object.keys(groups).sort((a, b) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }).map(key => groups[key]) as TreeNode<PlatformAppEntry>[];

        if (groups[""]) {
            const unnamedGroup = sortedGroup.shift();
            return sortedGroup.concat(unnamedGroup.children);
        }

        return sortedGroup;
    }

    private groupByCategory(nodes: { data?: PlatformAppEntry }[], expandedNodes: string[] = []) {
        const groups = nodes.reduce((acc, node: TreeNode<PlatformAppEntry>) => {

            const groupKeys = node.data["sbg:categories"];

            groupKeys.forEach(category => {

                if (!acc[category]) {
                    const id      = "__category/" + category;
                    acc[category] = {
                        id,
                        label: category,
                        isExpandable: true,
                        isExpanded: expandedNodes.indexOf(id) !== -1,
                        type: "category",
                        children: [],
                        icon: "fa-folder"
                    };
                }
                acc[category].children.push(node);
            });

            return acc;
        }, {});


        const sortedGroup = Object.keys(groups).sort((a, b) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        }).map(key => groups[key]) as TreeNode<PlatformAppEntry>[];

        return sortedGroup;
    }

    private loadDataSources() {
        this.tracked = this.dataGateway.getPublicApps().subscribe(apps => {
            this.treeNodes = apps.map(app => {
                return {
                    id: app.id,
                    label: app.label,
                    type: "app",
                    data: app,
                    icon: app.class === "Workflow" ? "fa-share-alt" : "fa-terminal",
                };
            });

            this.regroup(this.grouping, true);
        });
    }

    private attachSearchObserver() {


        const appSearch = (term) => this.dataGateway.searchPublicApps(term).map(results => results.map(result => {
            return {
                title: result.label,
                label: `${result["sbg:toolkit"]} / ${result["sbg:categories"].join(", ")}`,
                icon: result.class === "Workflow" ? "fa-share-alt" : "fa-terminal",
            };
        }));

        this.searchContent.valueChanges
            .do(term => this.searchResults = undefined)
            .debounceTime(250)
            .distinctUntilChanged()
            .do(term => {
                this.appliedSearchTerm = term;
            })
            .filter(term => term.trim().length !== 0)
            .switchMap(term => appSearch(term))
            .subscribe(results => {
                this.searchResults = results;
                this.cdr.markForCheck();
            });
    }

    private attachExpansionStateSaving() {
        this.tree.expansionChanges
            .flatMap(node => this.preferences.get("expandedNodes"), (node, expanded) => ({node, expanded}))
            .subscribe((data: { node: any, expanded: string[] }) => {
                const {node, expanded} = data;

                if (node.isExpanded && expanded.indexOf(node.id) === -1) {
                    this.preferences.put("expandedNodes", expanded.concat(node.id));
                } else if (!node.isExpanded) {
                    const idx = expanded.indexOf(node.id);
                    if (idx !== -1) {
                        expanded.splice(idx, 1);
                        this.preferences.put("expandedNodes", expanded);
                    }
                }
            });
    }


    private listenForAppOpening() {
        this.tree.open.filter(n => n.type === "app")
            .flatMap(node => this.platform.getApp(node.data["sbg:id"]))
            .subscribe(app => {
                this.workbox.openTab({
                    id: app.id,
                    title: Observable.of(app.label),
                    contentType: Observable.of(app["class"]),
                    contentData: {
                        id: app.id,
                        data: app,
                        type: "file",
                        language: Observable.of("json"),
                        isWritable: true,
                        resolve: () => Observable.of(app).toPromise(),
                        content: Observable.of(JSON.stringify(app, null, 4)),
                        save: (jsonContent, revisionNote) => {
                            return this.platform.saveApp(jsonContent, revisionNote);
                        }
                    }
                });
            });
    }
}
