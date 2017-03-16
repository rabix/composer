import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChildren} from "@angular/core";
import {FormControl} from "@angular/forms";

import "rxjs/add/operator/map";

import {LocalFileRepositoryService} from "../../../file-repository/local-file-repository.service";
import {PlatformAPI} from "../../../services/api/platforms/platform-api.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {TreeNodeComponent} from "../../../ui/tree-view/tree-node/tree-node.component";
import {TreeViewService} from "../../../ui/tree-view/tree-view.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {FilesystemEntry, FolderListing} from "../../data-gateway/data-types/local.types";
import {WorkboxService} from "../../workbox/workbox.service";
import {NavSearchResultComponent} from "../nav-search-result/nav-search-result.component";

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
                             && !searchResults?.length"></ct-block-loader>

            <div *ngIf="searchContent.value 
                        && searchContent.value === appliedSearchTerm 
                        && (searchResults && searchResults.length === 0)"
                 class="no-results m-1">
                <p class="explanation">
                    No search results for “{{ searchContent.value }}.”
                </p>
                <i class="icon fa-4x fa fa-search"></i>
            </div>

            <ct-tree-view [hidden]="searchContent?.value" [nodes]="treeNodes" [level]="1"></ct-tree-view>
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

    expandedNodes;

    @ViewChildren(NavSearchResultComponent, {read: ElementRef})
    private searchResultComponents: QueryList<ElementRef>;

    constructor(private tree: TreeViewService,
                private preferences: UserPreferencesService,
                private platform: PlatformAPI,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private dataGateway: DataGatewayService) {
        super();

        this.expandedNodes = this.preferences.get("workspace.expandedNodes", []);

        this.loadDataSources();
        this.attachSearchObserver();
        this.listenForLocalExpansion();
        this.listenForPlatformExpansion();
        this.listenForProjectExpansion();
        this.listenForFolderExpansion();

        this.attachExpansionStateSaving();


        //
        // this.tree.open.filter(n => n.node.type === "sbpla-app")
        //     .map(n => n.node.data)
        //     .flatMap(app => this.platform.getApp(app["sbg:id"]))
        //     .subscribe(app => {
        //         this.workbox.openTab({
        //             id: app.id,
        //             title: app.name,
        //             contentType: Observable.of(app.class),
        //             contentData: app
        //         });
        //     });


    }

    ngOnInit(): void {
    }

    private search(term) {
        return this.tree.getAllChildren()
            .filter((c: TreeNodeComponent<any>) => {
                return (c.type === "app" || c.type === "file")
                    && c.label.toLocaleLowerCase().indexOf(term.toLowerCase()) !== -1;
            });
    }

    ngAfterViewInit() {
        this.searchResultComponents.changes.subscribe(list => {
            list.forEach((el, idx) => setTimeout(() => el.nativeElement.classList.add("shown"), idx * 20));
        });
    }

    private loadDataSources() {
        this.tracked = this.dataGateway.getDataSources().subscribe(sources => {
            this.treeNodes = sources.map(source => {
                let icon = `fa-user-circle-o`;
                if (source.profile === "local") {
                    icon = "fa-hdd-o";
                }
                return {
                    id: source.profile,
                    label: source.label,
                    isExpandable: true,
                    type: "source",
                    icon: `${icon} ${source.connected ? "connected" : "disconnected"}`

                };
            });
            this.cdr.markForCheck();
        });
    }

    private attachSearchObserver() {
        this.searchContent
            .valueChanges
            .debounceTime(250)
            .distinctUntilChanged()
            .subscribe(val => {
                this.appliedSearchTerm = val;

                if (val.trim().length === 0 || (this.searchResults && this.searchResults.length === 0)) {
                    this.searchResults = undefined;
                    return;
                }

                this.searchResults = this.search(val)
                    .map(node => {
                        let label = "";
                        if (node.type === "app") {
                            label = node.id.split("/").slice(5, 7).join(" → ");
                        } else if (node.type === "file") {
                            label = node.id.split("/").slice(-3, -1).join(" → ");
                        }

                        return {
                            title: node.label,
                            label: label,
                            open: () => node.open(),
                            icon: node.icon
                        };
                    });
                this.cdr.markForCheck();
            });
    }

    /**
     * Expansion of a source root
     */
    private listenForPlatformExpansion() {

        this.tree.expansionChanges
            .filter(node =>
            node.isExpanded === true
            && node.type === "source"
            && node.id !== "local")
            .do(n => n.modify(() => n.loading = true))
            .switchMap(n => this.dataGateway.getPlatformListing(n.id), (node, listing = []) => ({node, listing}))
            .subscribe((data: { node: TreeNodeComponent<any>, listing: any }) => {
                const children = data.listing.map(child => {
                    return {
                        id: `${data.node.id}/${child.slug}`,
                        type: "project",
                        data: child,
                        icon: "fa-folder",
                        label: child.name,
                        isExpandable: true,
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
            .subscribe((data: { node: TreeNodeComponent<any>, listing: any }) => {
                const children = data.listing.map(path => {
                    return {
                        id: path,
                        type: "folder",
                        icon: "fa-folder",
                        label: path.split("/").pop(),
                        isExpandable: true,
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

    private listenForProjectExpansion() {
        this.tree.expansionChanges.filter(n => n.isExpanded === true && n.type === "project")
            .do(n => n.modify(() => n.loading = true))
            .switchMap(n => {
                const source      = n.id.substr(0, n.id.indexOf("/"));
                const projectName = n.id.substr(n.id.indexOf("/") + 1);

                return this.dataGateway.getProjectListing(source, projectName);
            }, (node, listing) => ({
                node,
                listing
            }))
            .subscribe(data => {
                console.log("Project listing", data.listing);
                const children = data.listing.map(app => {
                    return {
                        id: data.node.id + "/" + app["sbg:id"],
                        type: "app",
                        label: app.label,
                        icon: app.class === "CommandLineTool" ? "fa-terminal" : "fa-share-alt",
                        data: app
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
            .switchMap(n => this.dataGateway.getFolderListing(n.id), (node, listing) => ({node, listing}))
            .subscribe((data: {
                            node: TreeNodeComponent<FilesystemEntry>
                            listing: FolderListing
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
            .flatMap(node => this.preferences.get("workspace.expandedNodes", []).take(1), (node, expanded) => ({node, expanded}))
            .subscribe(data => {
                const {node, expanded} = data;

                console.log("Currently expanded", expanded);
                if (node.isExpanded && expanded.indexOf(node.id) === -1) {
                    this.preferences.put("workspace.expandedNodes", expanded.concat(node.id));
                } else {

                    const idx = expanded.indexOf(node.id);
                    if (idx !== -1) {
                        expanded.splice(idx, 1);
                        this.preferences.put("workspace.expandedNodes", expanded);
                    }
                }
            });

        // this.tree.nodeInit.bufferTime(200).subscribe((node) => {
        //     console.log("Node init", node);
        // });
        this.tree.nodeInit.withLatestFrom(this.preferences.get("workspace.expandedNodes", []), (nodes, expanded) => ({
            nodes,
            expanded
        }))
        // .filter(data => data.expanded.indexOf(data.node.id) !== -1)
            .subscribe(data => {
                console.log("Init nodes", data);
            });

    }
}
