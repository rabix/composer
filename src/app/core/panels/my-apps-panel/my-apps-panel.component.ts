import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";

import "rxjs/add/operator/map";

import {LocalFileRepositoryService} from "../../../file-repository/local-file-repository.service";
import {PlatformAPI} from "../../../services/api/platforms/platform-api.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {TreeNodeComponent} from "../../../ui/tree-view/tree-node/tree-node.component";
import {TreeViewComponent} from "../../../ui/tree-view/tree-view.component";
import {TreeViewService} from "../../../ui/tree-view/tree-view.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {FilesystemEntry, FolderListing} from "../../data-gateway/data-types/local.types";
import {WorkboxService} from "../../workbox/workbox.service";
import {NavSearchResultComponent} from "../nav-search-result/nav-search-result.component";

import * as Yaml from "js-yaml";

@Component({
    selector: "ct-my-apps-panel",
    template: `
        <ct-search-field class="m-1" [formControl]="searchContent"
                         [placeholder]="'Search My Apps...'"></ct-search-field>

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

            <ct-tree-view #tree [hidden]="searchContent?.value" [nodes]="treeNodes" [level]="1"></ct-tree-view>
        </div>
    `,
    providers: [TreeViewService, LocalFileRepositoryService],
    styleUrls: ["./my-apps-panel.component.scss"]
})
export class MyAppsPanelComponent extends DirectiveBase implements OnInit, AfterViewInit {

    treeNodes: TreeNode<any>[];

    searchContent = new FormControl();

    searchResults = undefined;

    appliedSearchTerm: string;

    expandedNodes: Observable<string[]>;

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
    }

    ngOnInit(): void {

        this.loadDataSources();
        this.attachSearchObserver();
        this.listenForLocalExpansion();
        this.listenForPlatformExpansion();
        this.listenForProjectExpansion();
        this.listenForFolderExpansion();
        this.attachExpansionStateSaving();
        this.listenForAppOpening();

    }

    ngAfterViewInit() {
        this.searchResultComponents.changes.subscribe(list => {
            list.forEach((el, idx) => setTimeout(() => el.nativeElement.classList.add("shown"), idx * 20));
        });
    }

    private loadDataSources() {
        this.tracked = this.dataGateway.getDataSources()
            .withLatestFrom(this.expandedNodes, (sources, expanded) => ({sources, expanded}))
            .subscribe((data: { sources: any[], expanded: string[] }) => {
                this.treeNodes = data.sources.map(source => {
                    let icon = `fa-user-circle-o`;
                    if (source.profile === "local") {
                        icon = "fa-hdd-o";
                    }
                    return {
                        id: source.profile,
                        label: source.label,
                        isExpandable: true,
                        isExpanded: data.expanded.indexOf(source.profile) !== -1,
                        type: "source",
                        icon: `${icon} ${source.connected ? "connected" : "disconnected"}`

                    };
                });
                this.cdr.markForCheck();
            });
    }

    private attachSearchObserver() {

        const localFileSearch = (term) => this.dataGateway.searchLocalProjects(term).map(results => results.map(result => {
            const label   = result.path.split("/").slice(-3, -1).join("/");
            const title   = result.path.split("/").pop();
            let icon      = "fa-file";
            let relevance = result.relevance;

            if (result.type === "Workflow") {
                icon = "fa-share-alt";
                relevance++;
            } else if (result.type === "CommandLineTool") {
                icon = "fa-terminal";
                relevance++;
            }


            return {
                title,
                label,
                icon,
                relevance
            };
        }));
        const projectsSearch  = (term) => this.dataGateway.searchUserProjects(term).map(results => results.map(result => {
            return {
                title: result.label,
                label: result.id.split("/").slice(5, 7).join(" → "),
                icon: result.class === "Workflow" ? "fa-share-alt" : "fa-terminal",
                relevance: result.relevance + 1
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
            .switchMap(term => Observable.forkJoin(localFileSearch(term), projectsSearch(term)))
            .subscribe(datasets => {
                const combined     = [].concat(...datasets).sort((a, b) => b.relevance - a.relevance);
                this.searchResults = combined;
                this.cdr.markForCheck();
            });
    }

    /**
     * Expansion of a source root
     */
    private listenForPlatformExpansion() {

        this.tree.expansionChanges
            .filter(node => node.isExpanded === true && node.type === "source" && node.id !== "local")
            .do(n => n.modify(() => n.loading = true))
            .flatMap(n => this.dataGateway.getPlatformListing(n.id), (node, listing = []) => ({node, listing}))
            .withLatestFrom(this.expandedNodes, (outer, expanded) => ({...outer, expanded}))
            .subscribe((data: { node: TreeNodeComponent<any>, listing: any, expanded: string[] }) => {
                const children = data.listing.map(child => {
                    const id = `${data.node.id}/${child.slug}`;
                    return {
                        id,
                        type: "project",
                        data: child,
                        icon: "fa-folder",
                        label: child.name,
                        isExpandable: true,
                        isExpanded: data.expanded.indexOf(id) !== -1,
                        iconExpanded: "fa-folder-open",
                    };
                });

                // Update the tree view
                data.node.modify(() => {
                    data.node.loading  = false;
                    data.node.children = children;
                });
            });
    }

    private listenForLocalExpansion() {

        this.tree.expansionChanges.filter(n => n.isExpanded === true && n.type === "source" && n.id === "local")
            .do(n => n.modify(() => n.loading = true))
            .switchMap(n => this.dataGateway.getLocalListing(), (node, listing) => ({node, listing}))
            .withLatestFrom(this.expandedNodes, (outer, expanded) => ({...outer, expanded}))
            .subscribe((data: { node: TreeNodeComponent<any>, listing: any, expanded: string[] }) => {
                const children = data.listing.map(path => {
                    return {
                        id: path,
                        type: "folder",
                        icon: "fa-folder",
                        label: path.split("/").pop(),
                        isExpandable: true,
                        isExpanded: data.expanded.indexOf(path) !== -1,
                        iconExpanded: "fa-folder-open",
                    };
                });

                // Update the tree view
                data.node.modify(() => {
                    data.node.children = children;
                    data.node.loading  = false;
                });
            });
    }

    private listenForProjectExpansion() {
        this.tree.expansionChanges.filter(n => n.isExpanded === true && n.type === "project")
            .do(n => n.modify(() => n.loading = true))
            .flatMap(n => {
                const source      = n.id.substr(0, n.id.indexOf("/"));
                const projectName = n.id.substr(n.id.indexOf("/") + 1);
                return this.dataGateway.getProjectListing(source, projectName);
            }, (node, listing) => ({node, listing}))
            .subscribe(data => {

                const children = data.listing.map(app => {
                    return {
                        id: data.node.id + "/" + app["sbg:id"],
                        type: "app",
                        label: app.label,
                        icon: app.class === "CommandLineTool" ? "fa-terminal" : "fa-share-alt",
                        data: app,
                    };
                });
                data.node.modify(() => {
                    data.node.children = children;
                    data.node.loading  = false;
                });
            });
    }

    private listenForFolderExpansion() {
        this.tree.expansionChanges
            .filter(n => n.isExpanded === true && n.type === "folder")
            .do(n => n.modify(() => n.loading = true))
            .flatMap(n => this.dataGateway.getFolderListing(n.id), (node, listing) => ({node, listing}))
            .withLatestFrom(this.expandedNodes, (outer, expanded) => ({...outer, expanded}))
            .subscribe((data: {
                            node: TreeNodeComponent<FilesystemEntry>
                            listing: FolderListing,
                            expanded: string[]
                        }) => {
                const children = data.listing.map(entry => {

                    let icon = "fa-file";
                    let iconExpanded;

                    if (entry.isDir) {
                        icon         = "fa-folder";
                        iconExpanded = "fa-folder-open";
                    } else if (entry.type === "Workflow") {
                        icon = "fa-share-alt";
                    } else if (entry.type === "CommandLineTool") {
                        icon = "fa-terminal";
                    }
                    return {
                        icon,
                        data: entry,
                        iconExpanded,
                        id: entry.path,
                        isExpandable: entry.isDir,
                        isExpanded: entry.isDir && data.expanded.indexOf(entry.path) !== -1,
                        type: entry.isDir ? "folder" : "file",
                        label: entry.path.split("/").pop(),
                    };
                });


                data.node.modify(() => {
                    data.node.children = children;
                    data.node.loading  = false;
                });
            });
    }

    private attachExpansionStateSaving() {
        this.tree.expansionChanges
            .flatMap(node => this.preferences.get("expandedNodes", []).take(1), (node, expanded) => ({node, expanded}))
            .subscribe(data => {
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
                console.log("Should open app", app);
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

        this.tree.open.filter(n => n.type === "file")
            .flatMap(node => this.dataGateway.getLocalFile(node.data.path), (node, content) => ({node, content}))
            .subscribe(data => {
                console.log("Should open app", data);
                const {node, content} = data;

                this.workbox.openTab({
                    id: node.data.path,
                    title: Observable.of(node.data.name),
                    contentType: Observable.of(node.data.type || "Code"),
                    contentData: {
                        data: node.data,
                        // @todo(batke)
                        resolve: () => Observable.of(Yaml.safeLoad(content)).toPromise(),
                        isWritable: true,
                        content: Observable.of(content),
                        language: Observable.of(node.data.language)
                    }
                });

            });
    }
}
