import {Injectable} from "@angular/core";
import "rxjs/add/operator/withLatestFrom";
import {Observable} from "rxjs/Observable";
import {App} from "../../../../../electron/src/sbg-api-client/interfaces/app";
import {Project} from "../../../../../electron/src/sbg-api-client/interfaces/project";
import {AuthService} from "../../../auth/auth.service";
import {AuthCredentials} from "../../../auth/model/auth-credentials";
import {LocalFileRepositoryService} from "../../../file-repository/local-file-repository.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {IpcService} from "../../../services/ipc.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {FilesystemEntry} from "../../data-gateway/data-types/local.types";
import {GlobalService} from "../../global/global.service";

@Injectable()
export class MyAppsPanelService {

    projects: Observable<Project[]>;
    expandedNodes: Observable<string[]>;
    rootFolders: Observable<TreeNode<any>[]>;
    localExpandedNodes: Observable<string[]>;
    localFolders: Observable<TreeNode<any>[]>;

    constructor(private auth: AuthService,
                private ipc: IpcService,
                private global: GlobalService,
                private localRepository: LocalRepositoryService,
                private localFileRepository: LocalFileRepositoryService,
                private platformRepository: PlatformRepositoryService) {


        this.localFolders       = this.localRepository.getLocalFolders();
        this.projects           = this.platformRepository.getOpenProjects();
        this.localExpandedNodes = this.localRepository.getExpandedFolders();
        this.rootFolders        = this.getRootFolders();
    }

    private static makeTreeNode(data: Partial<TreeNode<any>>): TreeNode<any> {
        return Object.assign({
            type: "source",
            icon: "fa-folder",
            isExpanded: Observable.of(false),
            isExpandable: true,
            iconExpanded: "fa-folder-open",
        }, data);
    }

    /**
     * Gives an observable of root tree nodes.
     */
    getRootFolders(): Observable<TreeNode<any>[]> {
        const localFolder = Observable.of(MyAppsPanelService.makeTreeNode({
            id: "local",
            label: "Local Files",
            children: this.getLocalNodes(),
            isExpanded: this.localExpandedNodes.map(list => list.indexOf("local") !== -1)
        }));

        const platformEntry = this.auth.getActive().map(credentials => {
            if (!credentials) {
                return null;
            }
            const platformHash = credentials.getHash();

            return {
                id: platformHash,
                data: credentials,
                type: "source",
                icon: "fa-folder",
                iconExpanded: "fa-folder-open",
                label: AuthCredentials.getPlatformLabel(credentials.url),
                isExpandable: true,
                isExpanded: this.platformRepository.getExpandedNodes().map(list => list.indexOf(platformHash) !== -1),
                children: this.platformRepository.getOpenProjects().map(projects => this.createPlatformListingTreeNodes(projects))
            };
        });

        return Observable
            .combineLatest(localFolder, platformEntry)
            .map(list => list.filter(v => v));
    }

    getLocalNodes(): Observable<TreeNode<string>[]> {
        return this.localRepository.getLocalFolders()
            .map(folders => {
                return folders.map(path => MyAppsPanelService.makeTreeNode({
                    id: path,
                    data: path,
                    type: "folder",
                    label: path.split("/").pop(),
                    isExpanded: this.localExpandedNodes.map(list => list.indexOf(path) !== -1),
                    children: Observable.empty()
                        .concat(this.localFileRepository.watch(path))
                        .map(listing => this.createDirectoryListingTreeNodes(listing))

                }));
            });
    }

    reloadPlatformData() {
        this.global.reloadPlatformData();
    }

    updateLocalNodeExpansionState(path: string, state: boolean): void {
        this.localRepository.setFolderExpansion(path, state);
    }

    updatePlatformNodeExpansionState(path: string, state: boolean): void {
        this.platformRepository.setNodeExpansion(path, state);
    }

    private createDirectoryListingTreeNodes(listing: FilesystemEntry[]) {
        return listing.map(fsEntry => {

            const id    = fsEntry.path;
            const label = fsEntry.path.split("/").pop();

            let icon           = "fa-folder";
            const iconExpanded = "fa-folder-open";

            if (fsEntry.type === "Workflow") {
                icon = "fa-share-alt";
            } else if (fsEntry.type === "CommandLineTool") {
                icon = "fa-terminal";
            } else if (fsEntry.isFile) {
                icon = "fa-file";
            }

            let children = undefined;

            if (fsEntry.isDir) {
                children = Observable.empty()
                    .concat(this.ipc.request("readDirectory", fsEntry.path))
                    .map(list => this.createDirectoryListingTreeNodes(list));
            }

            return MyAppsPanelService.makeTreeNode({
                id,
                icon,
                label,
                children,
                iconExpanded,
                data: fsEntry,
                dragLabel: label,
                dragDropZones: ["zone1"],
                isExpandable: fsEntry.isDir,
                dragTransferData: fsEntry.path,
                type: fsEntry.isDir ? "folder" : "file",
                isExpanded: this.localExpandedNodes.map(list => list.indexOf(fsEntry.path) !== -1),
                dragEnabled: ["Workflow", "CommandLineTool"].indexOf(fsEntry.type) !== -1,
                dragImageClass: fsEntry.type === "CommandLineTool" ? "icon-command-line-tool" : "icon-workflow",

            });
        });
    }

    private createPlatformListingTreeNodes(projects: Project[]): TreeNode<Project>[] {
        return projects.map(project => {

            return {
                id: project.id,
                data: project,
                type: "project",
                icon: "fa-folder",
                label: project.name,
                isExpanded: this.platformRepository.getExpandedNodes().map(list => list.indexOf(project.id) !== -1),
                isExpandable: true,
                iconExpanded: "fa-folder-open",
                children: this.platformRepository.getAppsForProject(project.id).map(apps => this.createPlatformAppListingTreeNodes(apps)),

            };
        });
    }

    private createPlatformAppListingTreeNodes(apps: App[]): TreeNode<App>[] {
        return apps.map(app => {

            return {
                id: app.id,
                data: app,
                label: app.name,
                type: "app",
                icon: app.raw.class === "CommandLineTool" ? "fa-terminal" : "fa-share-alt",
                dragEnabled: true,
                dragTransferData: app.id,
                dragDropZones: ["zone1"],
                dragLabel: app.name,
                dragImageClass: app.raw.class === "CommandLineTool" ? "icon-command-line-tool" : "icon-workflow",
            };
        });
    }

    removeProjectFromWorkspace(projectID): Promise<any> {

        return this.platformRepository.removeOpenProjects(projectID);
    }

    removeFolderFromWorkspace(folderPath) {
        return this.localRepository.removeLocalFolders(folderPath);
    }
}
