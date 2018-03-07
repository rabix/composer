import {ChangeDetectorRef, Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {App} from "../../../../../electron/src/sbg-api-client/interfaces/app";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {NativeSystemService} from "../../../native/system/native-system.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {TreeNode} from "../../../ui/tree-view/tree-node";
import {AppHelper} from "../../helpers/AppHelper";
import {WorkboxService} from "../../workbox/workbox.service";
import {AppsPanelService} from "../common/apps-panel.service";
import {of} from "rxjs/observable/of";
import {map} from "rxjs/operators";

@Injectable()
export class PublicAppsPanelService extends AppsPanelService {

    private apps: Observable<App[]>;

    constructor(protected platformRepository: PlatformRepositoryService,
                fileRepository: FileRepositoryService,
                notificationBar: NotificationBarService,
                workbox: WorkboxService,
                cdr: ChangeDetectorRef,
                statusBar: StatusBarService,
                native: NativeSystemService) {

        super(fileRepository, platformRepository, notificationBar, workbox, statusBar, cdr, native);

        this.apps = platformRepository.getPublicApps().pipe(
            map(apps => apps || [])
        );
    }

    getAppsByNone(): Observable<TreeNode<any>[]> {
        return this.apps.pipe(
            map(array => array.slice()
                .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                .map(app => this.makeAppTreeNode(app))
            )
        );
    }

    getAppsGroupedByToolkit(): Observable<TreeNode<any>[]> {
        return this.apps.pipe(
            map(apps => {

                const toolkits = apps.reduce((acc, app) => {
                    const tk        = (app.raw && app.raw["sbg:toolkit"]) || "";
                    const tkVersion = (app.raw && app.raw["sbg:toolkitVersion"]) || "";

                    const fullToolkitName = `${tk} ${tkVersion}`.trim();

                    if (!acc[fullToolkitName]) {
                        acc[fullToolkitName] = [];
                    }

                    acc[fullToolkitName].push(app);

                    return acc;
                }, {});

                const folderNodes  = [];
                const freeAppNodes = [];

                Object.keys(toolkits)
                    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                    .forEach(toolkit => {

                        const appNodes = toolkits[toolkit]
                            .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
                            .map(app => this.makeAppTreeNode(app));

                        if (toolkit === "") {
                            freeAppNodes.push(...appNodes);
                            return;
                        }

                        const nodeID = `__toolkit/${toolkit}`;

                        folderNodes.push({
                            id: nodeID,
                            type: "toolkit",
                            label: toolkit,
                            isExpanded: this.platformRepository.getExpandedNodes().pipe(
                                map(list => (list || []).indexOf(nodeID) !== -1)
                            ),
                            isExpandable: true,
                            icon: "fa-folder",
                            children: of(appNodes)
                        });
                    });

                return [...folderNodes, ...freeAppNodes];
            })
        );
    }

    getAppsGroupedByCategory(): Observable<TreeNode<any>[]> {
        return this.apps.pipe(
            map(apps => {

                const categories = apps.reduce((acc, app) => {
                    const appCategories = (app.raw && app.raw["sbg:categories"]) || ["__uncategorized__"];

                    appCategories.forEach(category => {
                        if (!acc[category]) {
                            acc[category] = [];
                        }

                        acc[category].push(app);
                    });

                    return acc;

                }, {});

                const folderNodes           = [];
                const uncategorizedAppNodes = [];

                Object.keys(categories)
                    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
                    .forEach(category => {

                        const appNodes = categories[category]
                            .map(app => this.makeAppTreeNode(app))
                            .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

                        if (category === "__uncategorized__") {
                            uncategorizedAppNodes.push(...appNodes);
                            return;
                        }

                        const nodeID = `__category/${category}`;
                        folderNodes.push({
                            id: nodeID,
                            type: "category",
                            label: category,
                            isExpanded: this.platformRepository.getExpandedNodes().pipe(
                                map(list => (list || []).indexOf(nodeID) !== -1)
                            ),
                            isExpandable: true,
                            children: of(appNodes),
                            icon: "fa-folder",
                            iconExpanded: "fa-folder-open"
                        });
                    });

                return [...folderNodes, ...uncategorizedAppNodes];
            })
        );
    }

    private makeAppTreeNode(app: App): TreeNode<App> {

        let appType    = null;
        let icon       = "fa-question";
        let imageClass = "";

        if (app.raw && app.raw.class) {
            appType = app.raw.class;
        }

        if (appType === "CommandLineTool") {
            icon       = "fa-terminal";
            imageClass = "icon-command-line-tool";
        }

        if (appType === "Workflow") {
            icon       = "fa-share-alt";
            imageClass = "icon-workflow";
        }

        const tkVersion = (app.raw && app.raw["sbg:toolkitVersion"]) || "";

        return {
            id: AppHelper.getRevisionlessID(app.id),
            data: app,
            type: "app",
            label: `${app.name} ${tkVersion}`,
            dragEnabled: true,
            dragLabel: app.name,
            dragDropZones: ["graph-editor"],
            dragTransferData: {name: app.id, type: "cwl"},
            icon: icon,
            dragImageClass: imageClass,
        };
    }


}
