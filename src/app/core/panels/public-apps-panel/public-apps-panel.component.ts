import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {FormControl} from "@angular/forms";

import "rxjs/add/operator/map";

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
import {AuthService} from "../../../auth/auth/auth.service";
import {Observable} from "rxjs/Observable";

@Component({
    selector: "ct-public-apps-panel",
    template: `
        <ct-search-field class="m-1" [formControl]="searchContent"
                         [placeholder]="'Search Public Apps...'"></ct-search-field>

        <div class="btn-group grouping-toggle" *ngIf="!searchContent?.value">
            <button type="button"
                    (click)="regroup('toolkit')"
                    [class.active]="grouping === 'toolkit'"
                    class="btn btn-secondary">By Toolkit
            </button>

            <button type="button"
                    (click)="regroup('category')"
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

                                      [ct-drag-enabled]="entry?.dragEnabled"
                                      [ct-drag-transfer-data]="entry?.dragTransferData"
                                      [ct-drag-image-caption]="entry?.dragLabel"
                                      [ct-drag-image-class]="entry?.dragImageClass"
                                      [ct-drop-zones]="entry?.dragDropZones"

                                      (dblclick)="openSearchResult(entry)"
                ></ct-nav-search-result>
            </div>
            <ct-line-loader class="m-1"
                            *ngIf="searchContent.value 
                             && searchContent.value !== appliedSearchTerm 
                             && !searchResults"></ct-line-loader>

            <div *ngIf="searchContent.value 
                        && searchContent.value === appliedSearchTerm 
                        && (searchResults && searchResults?.length === 0)"
                 class="no-results m-1">
                <p class="explanation">
                    No search results for “{{ searchContent.value }}.”
                </p>
                <i class="icon fa-4x fa fa-search"></i>
            </div>

            <ct-tree-view #tree [class.hidden]="searchContent?.value" [nodes]="groupedNodes"
                          [level]="1"></ct-tree-view>
        </div>
    `,
    providers: [LocalFileRepositoryService],
    styleUrls: ["./public-apps-panel.component.scss"]
})
export class PublicAppsPanelComponent extends DirectiveBase implements AfterViewInit {

    treeNodes: TreeNode<any>[] = [];

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

    private tree: TreeViewService;

    constructor(private preferences: UserPreferencesService,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private auth: AuthService,
                private dataGateway: DataGatewayService) {
        super();

        this.expandedNodes = this.preferences.get("expandedNodes", []).take(1).publishReplay(1).refCount();


        this.tracked = this.preferences.get("publicAppsGrouping", "toolkit").subscribe(grouping => {
            this.grouping = grouping;
        });
    }

    ngAfterViewInit() {

        this.tree = this.treeComponent.getService();

        setTimeout(() => {
            this.loadDataSources();
            this.attachSearchObserver();
            this.attachExpansionStateSaving();
            this.listenForAppOpening();
        });

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

    private groupByToolkit(folders, expandedNodes: string[] = []) {

        return folders.map(folder => {

            const groups = folder.children.reduce((acc, node) => {

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
            return {...folder, children: sortedGroup};
        });
    }

    private groupByCategory(folders, expandedNodes: string[] = []) {
        const categorized = folders.map(folder => {

            const groups = folder.children.reduce((acc, node: TreeNode<PlatformAppEntry>) => {
                const groupKeys = node.data["sbg:categories"] || [];
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

            const sorted = Object.keys(groups).sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            }).map(key => groups[key]) as TreeNode<PlatformAppEntry>[];

            return {...folder, children: sorted};
        });

        return categorized;
    }

    private loadDataSources() {
        this.tracked = this.auth.connections.flatMap(credentials => {
            const hashes   = credentials.map(c => c.hash);
            const requests = hashes.map(hash => this.dataGateway.getPublicApps(hash));
            return Observable.zip(...requests);
        }, (credentials, listings) => ({credentials, listings}))
            .withLatestFrom(this.preferences.get("expandedNodes"), (data, expanded) => ({...data, expanded}))
            .subscribe(data => {
                const {credentials, listings, expanded} = data as any;

                this.treeNodes = credentials.map((creds, index) => {
                    const id  = `${creds.hash}?public`;
                    let label = creds.profile;
                    if (label === "default") {
                        label = "Seven Bridges";
                    } else if (label === "cgc") {
                        label = "Cancer Genomics Cloud";
                    }

                    return {
                        id,
                        label: label,
                        type: "folder",
                        data: creds,
                        icon: "fa-folder",
                        isExpandable: true,
                        iconExpanded: "fa-folder-open",
                        isExpanded: expanded.indexOf(id) !== -1,
                        children: listings[index].map(app => {
                            const id = `${creds.hash}/${app.owner}/${app.slug}/${app["sbg:id"]}`;
                            return {
                                id,
                                label: app.label,
                                type: "app",
                                data: app,
                                icon: app.class === "Workflow" ? "fa-share-alt" : "fa-terminal",
                                dragEnabled: true,
                                dragTransferData: id,
                                dragDropZones: ["zone1"],
                                dragLabel: app.label,
                                dragImageClass: app.class === "CommandLineTool" ? "icon-command-line-tool" : "icon-workflow",
                            };
                        })

                    };
                });
                this.regroup(this.grouping, true);
            });
    }

    private attachSearchObserver() {


        const search = (term) => {


            const reversedTerm = term.split("").reverse().join("");
            return this.treeNodes.reduce((acc, node) => {
                return acc.concat(node.children.map(child => Object.assign(child, {parentLabel: node.label})));
            }, []).map((child) => {
                const fuzziness = DataGatewayService.fuzzyMatch(reversedTerm, child.id.split("").reverse().join(""));
                return {
                    id: child.id,
                    title: child.label,
                    label: [child["parentLabel"], child.data["sbg:toolkit"], (child.data["sbg:categories"] || []).join(", ")].join("/"),
                    icon: child.data.class === "Workflow" ? "fa-share-alt" : "fa-terminal",

                    dragEnabled: true,
                    dragTransferData: child.id,
                    dragLabel: child.label,
                    dragImageClass: child.data["class"] === "CommandLineTool" ? "icon-command-line-tool" : "icon-workflow",
                    dragDropZones: ["zone1"],

                    fuzziness
                };
            }).filter(child => child.fuzziness > 0.01)
                .sort((a, b) => b.fuzziness - a.fuzziness)
                .slice(0, 20);
        };

        this.searchContent.valueChanges
            .do(term => this.searchResults = undefined)
            .debounceTime(250)
            .distinctUntilChanged()
            .do(term => {
                this.appliedSearchTerm = term;
            })
            .filter(term => term.trim().length !== 0)
            .switchMap(term => Observable.of(search(term)))
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
            .flatMap(node => this.workbox.getOrCreateFileTab(node.id))
            .subscribe(tab => this.workbox.openTab(tab));
    }

    openSearchResult(entry: {
                         id: string
                     }) {
        this.workbox.getOrCreateFileTab(entry.id).take(1).subscribe(tab => this.workbox.openTab(tab));
    }
}
