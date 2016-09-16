import {Component, ChangeDetectionStrategy} from "@angular/core";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {TreeNode} from "../tree-view/types";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {ReplaySubject, Observable} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenFileRequestAction} from "../../action-events/index";
import {FileModel} from "../../store/models/fs.models";

@Component({
    selector: 'ct-file-tree',
    directives: [TreeViewComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-tree-view [nodes]="nodes"></ct-tree-view>
    `
})
export class FileTreeComponent {

    private nodes: TreeNode[];

    constructor(private platform: PlatformAPI, private eventHub: EventHubService) {

        this.nodes = [
            {
                name: "Projects",
                icon: "angle",
                childrenProvider: () => {
                    const cached = new ReplaySubject(1);

                    Observable.zip(this.platform.getOwnProjects(), this.platform.getApps(), (projects, apps) => {
                        const appMap = apps.map(app => ({
                            name: app.label,
                            model: app,
                            icon: app.class || "file",
                            openHandler: (node) => {

                                node.icon = "loader";
                                return this.platform.getAppCWL(app).subscribe(data => {
                                    node.icon = app.class || "file";
                                    this.eventHub.publish(new OpenFileRequestAction(new FileModel({
                                        name: app.label,
                                        absolutePath: app.id,
                                        content: data,
                                        type: "json"
                                    })));
                                });

                            }
                        })).reduce((acc, app) => {
                            acc[app.model["sbg:project"]] = [].concat.apply(acc[app.model["sbg:project"]] || [], [app]);
                            return acc;
                        }, {});

                        return projects.map(project => ({
                            name: project.name,
                            model: project,
                            icon: "folder",
                            childrenProvider: () => Observable.of(appMap[project.path] || [])
                        }))
                    }).subscribe(cached);

                    return cached;
                }

            },
            {
                name: "Public Apps",
                icon: "angle",
                childrenProvider: () => {
                    const cached = new ReplaySubject(1);
                    this.platform.getPublicApps().map(apps => apps.map(app => ({
                        name: app.label,
                        model: app,
                        icon: app.class || "file",
                        openHandler: (item) => {
                            item.icon = "loader";
                            return this.platform.getAppCWL(app).subscribe(data => {
                                item.icon = app.class || "file";
                                this.eventHub.publish(new OpenFileRequestAction(new FileModel({
                                    name: app.label,
                                    absolutePath: app.id,
                                    content: data,
                                    type: "json"
                                })));
                            })
                        }
                    }))).subscribe(cached);

                    return cached;
                }
            }
        ];
    }
}