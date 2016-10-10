import {Component, ChangeDetectionStrategy} from "@angular/core";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {FileModel} from "../../store/models/fs.models";
import {ReplaySubject} from "rxjs";
import {OpenFileRequestAction} from "../../action-events";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {PanelToolbarComponent} from "./panel-toolbar.component";

@Component({
    selector: "ct-sb-public-apps-panel",
    directives: [TreeViewComponent, PanelToolbarComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <name>Public Apps</name>
        </ct-panel-toolbar>
        <ct-tree-view [nodes]="nodes "></ct-tree-view>
    `
})
export class SBPublicAppsPanelComponent {

    private nodes;

    constructor(private platform: PlatformAPI, private eventHub: EventHubService) {

        this.nodes = [
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
        ]
    }

    ngOnInit() {
    }

}