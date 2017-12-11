import {AfterContentInit, AfterViewInit, ChangeDetectorRef, Component, ElementRef, QueryList, ViewChild, ViewChildren} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {TabData} from "../../../../../electron/src/storage/types/tab-data-interface";
import {NativeSystemService} from "../../../native/system/native-system.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ContextService} from "../../../ui/context/context.service";
import {MenuItem} from "../../../ui/menu/menu-item";
import {ModalService} from "../../../ui/modal/modal.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {getDragImageClass, getDragTransferDataType} from "../../../ui/tree-view/tree-view-utils";
import {TreeViewComponent} from "../../../ui/tree-view/tree-view.component";
import {TreeViewService} from "../../../ui/tree-view/tree-view.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {AppHelper} from "../../helpers/AppHelper";
import {AddSourceModalComponent} from "../../modals/add-source-modal/add-source-modal.component";
import {CreateAppModalComponent} from "../../modals/create-app-modal/create-app-modal.component";
import {CreateLocalFolderModalComponent} from "../../modals/create-local-folder-modal/create-local-folder-modal.component";
import {WorkboxService} from "../../workbox/workbox.service";
import {NavSearchResultComponent} from "../nav-search-result/nav-search-result.component";
import {MyAppsPanelService} from "./my-apps-panel.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";

@Component({
    selector: "ct-my-apps-panel",
    providers: [MyAppsPanelService],
    templateUrl: "./my-apps-panel.component.html",
    styleUrls: ["./my-apps-panel.component.scss"]
})
export class MyAppsPanelComponent extends DirectiveBase implements AfterContentInit, AfterViewInit {

    searchContent = new FormControl();

    searchResults = undefined;

    expandedNodes: Observable<string[]>;

    rootFolders: TreeNode<any>[] = [];

    @ViewChild(TreeViewComponent)
    treeView: TreeViewComponent;

    tree: TreeViewService;

    @ViewChildren(NavSearchResultComponent, {read: ElementRef})
    private searchResultComponents: QueryList<ElementRef>;

    constructor(private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private modal: ModalService,
                private dataGateway: DataGatewayService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService,
                private service: MyAppsPanelService,
                private native: NativeSystemService,
                private context: ContextService) {
        super();

    }

    ngAfterContentInit() {
        this.tree = this.treeView.getService();

        this.attachSearchObserver();

        this.attachExpansionStateSaving();
        this.listenForAppOpening();
        this.listenForContextMenu();

        this.service.rootFolders.subscribe(folders => {
            this.rootFolders = folders;
        });

    }

    ngAfterViewInit() {
        this.searchResultComponents.changes.subscribe(list => {
            list.forEach((el, idx) => setTimeout(() => el.nativeElement.classList.add("shown"), idx * 20));
        });
    }

    openAddAppSourcesDialog() {
        this.modal.fromComponent(AddSourceModalComponent, {
            title: "Open a Project",
            backdrop: true
        });
    }

    openSearchResult(entry: NavSearchResultComponent) {

        const tab = this.workbox.getOrCreateAppTab(entry.tabData);
        this.workbox.openTab(tab);
    }

    private attachSearchObserver() {

        const localFileSearch = (term) => this.dataGateway.searchLocalProjects(term).then(results => {
            return results.map(result => {
                const ds = AppHelper.DS;

                const id    = result.path;
                const label = result.path.split(ds).slice(-3, -1).join(ds);
                const title = result.path.split(ds).pop();

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
                    id, icon, title, label, relevance,
                    tabData: {
                        id: result.path,
                        isWritable: result.isWritable,
                        label: result.name,
                        language: ["cwl", "yml", "yaml"].indexOf(result.language) === -1 ? "json" : "yaml",
                        type: result.type || "Code",
                    } as TabData<any>,
                    type: "file",
                    dragEnabled: true,
                    dragTransferData: {name: id, type: getDragTransferDataType(result)},
                    dragLabel: title,
                    dragImageClass: getDragImageClass(result),
                    dragDropZones: ["graph-editor", "job-editor"]
                };
            });
        });

        const projectSearch = (term) =>
            Observable.combineLatest(this.platformRepository.getOpenProjects(), this.platformRepository.searchAppsFromOpenProjects(term))
                .take(1).toPromise().then(result => {
                const [projects, apps] = result;

                return apps.map(app => {

                    const project = projects.find((project) => project.id === app.project);

                    const revisionlessID = AppHelper.getRevisionlessID(app.id);

                    return {
                        id: revisionlessID,
                        icon: app.raw["class"] === "Workflow" ? "fa-share-alt" : "fa-terminal",
                        title: app.name,
                        label: app.id.split("/").join(" → "),
                        relevance: 1.5,

                        tabData: {
                            id: revisionlessID,
                            isWritable: project.permissions.write,
                            label: app.name,
                            language: "json",
                            type: app.raw["class"],
                        } as TabData<any>,

                        dragEnabled: true,
                        dragTransferData: {name: app.id, type: "cwl"},
                        dragLabel: app.name,
                        dragImageClass: app.raw["class"] === "CommandLineTool" ? "icon-command-line-tool" : "icon-workflow",
                        dragDropZones: ["graph-editor"]
                    };
                });
            });

        this.searchContent.valueChanges
            .do(term => this.searchResults = undefined)
            .debounceTime(250)
            .distinctUntilChanged()
            .filter(term => term.trim().length !== 0)
            .flatMap(term => Observable.zip(
                localFileSearch(term),
                projectSearch(term)
            ))
            .subscribeTracked(this, datasets => {
                const combined     = [].concat(...datasets).sort((a, b) => b.relevance - a.relevance);
                this.searchResults = combined;

                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
    }

    /**
     * Attaches an expansion state listener to the tree and dispatches state updates to
     * a service for saving.
     */
    private attachExpansionStateSaving(): void {

        this.tree.expansionChanges.subscribeTracked(this, node => {

            const state = node.getExpansionState();

            if (node.id === "local" || node.type === "folder") {
                return this.service.updateLocalNodeExpansionState(node.id, state);
            }

            this.service.updatePlatformNodeExpansionState(node.id, state);
        });
    }

    private listenForAppOpening() {

        const appOpening  = this.tree.open.filter(n => n.type === "app");
        const fileOpening = this.tree.open.filter(n => n.type === "file");

        appOpening.subscribe(node => {

            const label = node.data.name;
            const type  = node.data.raw.class === "CommandLineTool" ? "CommandLineTool" : "Workflow";

            const tab = this.workbox.getOrCreateAppTab({
                id: AppHelper.getRevisionlessID(node.data.id),
                type: type,
                label: label,
                isWritable: node.data.isWritable,
                language: "json",
            });

            this.workbox.openTab(tab);
        });

        fileOpening.subscribe(node => {
            const id         = node.id;
            const label      = node.label;
            const language   = node.data.language;
            const type       = node.data.type || "Code";
            const isWritable = node.data.isWritable;

            const tab = this.workbox.getOrCreateAppTab({
                id,
                type,
                label,
                language,
                isWritable
            });

            this.workbox.openTab(tab);
        });
    }

    private listenForContextMenu() {

        // Context streams
        const localRoot           = this.tree.contextMenu.filter(data => data.node.type === "source" && data.node.id === "local");
        const platformRoot        = this.tree.contextMenu.filter(data => data.node.type === "source" && data.node.id !== "local");
        const userProject         = this.tree.contextMenu.filter((data) => data.node.type === "project");
        const topLevelLocalFolder = this.tree.contextMenu.filter((data) => data.node.type === "folder" && data.node.level === 2);
        const nestedLocalFolder   = this.tree.contextMenu.filter(data => data.node.type === "folder" && data.node.level > 2);
        const platformApp         = this.tree.contextMenu.filter(data => data.node.type === "app");

        const platformRootMenuItems = [
            new MenuItem("Open a Project", {
                click: () => {
                    const component = this.modal.fromComponent(AddSourceModalComponent, "Open a Project");
                    component.activeTab = "platform";
                }
            }),
            new MenuItem("Synchronize Data", {
                click: () => this.service.reloadPlatformData()
            })
        ];

        const localRootMenuItems = [
            new MenuItem("Add a Folder", {
                click: () => {
                    this.native.openFolderChoiceDialog({
                        buttonLabel: "Add to Workspace"
                    }, true).then(paths => {
                        this.localRepository.addLocalFolders(paths, true).then(() => {
                            this.modal.close();
                        });
                    }).catch(() => {
                    });
                }
            })
        ];

        const createAppMenuItem = (node: TreeNode<any>, destination: "local" | "remote", type: "Workflow" | "CommandLineTool") => {

            return new MenuItem(`New ${type}`, {
                click: () => {
                    const modal = this.modal.fromComponent(CreateAppModalComponent, `Create a new ${type} in ${node.label}`);

                    modal.appType     = type;
                    modal.destination = destination;
                    if (destination === "local") {
                        modal.defaultFolder = node.id;

                        // Wait for component to initialize, then open the dialog for choosing the file path
                        setTimeout(() => {
                            modal.chooseFilepath();
                        });
                    } else {
                        modal.defaultProject = node.id;
                    }

                }
            });
        };

        const createFolderMenuItem = (node: TreeNode<any>) => new MenuItem("New Folder", {
            click: () => {
                const modal      = this.modal.fromComponent(CreateLocalFolderModalComponent, `Create a new Folder in ${node.label}`);
                modal.rootFolder = node.id;
            }
        });

        const createExploreMenuItem = (node: TreeNode<any>) => {
            let explorerName = "Explore on file system";
            if (this.native.isOS("MacOS")) {
                explorerName = "Open in Finder";
            } else if (this.native.isOS("Windows")) {
                explorerName = "Open in File Explorer";
            }
            return new MenuItem(explorerName, {
                click: () => this.native.exploreFolder(node.id)
            });
        };

        localRoot.subscribe(data => this.context.showAt(data.node.getViewContainer(), localRootMenuItems, data.coordinates));

        platformRoot.subscribe(data => this.context.showAt(data.node.getViewContainer(), platformRootMenuItems, data.coordinates));

        userProject.subscribe(data => {
            const contextMenu = [
                createAppMenuItem(data.node, "remote", "Workflow"),
                createAppMenuItem(data.node, "remote", "CommandLineTool"),
                new MenuItem("Remove from Workspace", {
                    click: () => this.service.removeProjectFromWorkspace(data.node.id)
                })
            ];
            this.context.showAt(data.node.getViewContainer(), contextMenu, data.coordinates);
        });

        topLevelLocalFolder.subscribe(data => {
            const contextMenu = [
                createAppMenuItem(data.node, "local", "Workflow"),
                createAppMenuItem(data.node, "local", "CommandLineTool"),
                createFolderMenuItem(data.node),
                createExploreMenuItem(data.node),
                new MenuItem("Remove from Workspace", {
                    click: () => this.service.removeFolderFromWorkspace(data.node.id)
                })
            ];

            this.context.showAt(data.node.getViewContainer(), contextMenu, data.coordinates);
        });

        nestedLocalFolder.subscribe(data => {
            const contextMenu = [
                createAppMenuItem(data.node, "local", "Workflow"),
                createAppMenuItem(data.node, "local", "CommandLineTool"),
                createExploreMenuItem(data.node),
                createFolderMenuItem(data.node),
            ];

            this.context.showAt(data.node.getViewContainer(), contextMenu, data.coordinates);
        });

        platformApp.subscribeTracked(this, (data) => {
            const contextMenu = [
                this.service.makeCopyAppToLocalMenuItem(data.node),
            ];

            this.context.showAt(data.node.getViewContainer(), contextMenu, data.coordinates);
        });
    }
}
