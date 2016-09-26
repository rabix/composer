import {Component, ChangeDetectionStrategy} from "@angular/core";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {ReplaySubject, Observable} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {FileModel} from "../../store/models/fs.models";
import {OpenFileRequestAction} from "../../action-events";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {PanelToolbarComponent} from "./panel-toolbar.component";

@Component({
    selector: "ct-sb-user-projects-panel",
    directives: [TreeViewComponent, BlockLoaderComponent, PanelToolbarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <name>Projects</name>
        </ct-panel-toolbar>
        <div *ngIf="isLoading" class="main node-base">
            <span class="icon-space">
                <i class="fa fa-fw fa-spinner fa-spin"></i>
            </span>
        </div>
        <ct-tree-view [nodes]="nodes | async"></ct-tree-view>
    `
})
export class SBUserProjectsPanelComponent {

    private nodes = new ReplaySubject(1);

    private isLoading = false;

    constructor(private platform: PlatformAPI, private eventHub: EventHubService) {

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
                icon: "angle",
                childrenProvider: () => Observable.of(appMap[project.path] || [])
            }))
        }).subscribe(r => {
            this.isLoading = false;
            this.nodes.next(r);
        });


    }

    ngOnInit() {
    }

}