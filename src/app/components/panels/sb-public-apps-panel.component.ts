import {Component} from "@angular/core";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {Observable, BehaviorSubject} from "rxjs";
import {OpenTabAction} from "../../action-events";
import {TreeViewComponent} from "../tree-view";
import {PanelToolbarComponent} from "./panel-toolbar.component";
import {SettingsService} from "../../services/settings/settings.service";
import {PlatformAppEntry} from "../../services/api/platforms/platform-api.types";

@Component({
    selector: "ct-sb-public-apps-panel",
    directives: [TreeViewComponent, PanelToolbarComponent],
    template: `
        <ct-panel-toolbar>
            <name>Public Apps</name>
        </ct-panel-toolbar>
        <ct-tree-view [nodes]="nodes"></ct-tree-view>
    `
})
export class SBPublicAppsPanelComponent {

    private nodes = [];

    constructor(private platform: PlatformAPI,
                private eventHub: EventHubService,
                private settings: SettingsService) {
    }

    ngOnInit() {

        this.settings.platformConfiguration.flatMap(_ => this.platform.getPublicApps().map(apps => {


            const categorized = apps.map(app => {
                return {
                    name: app.label,
                    icon: app.class || "file",
                    isExpandable: false,
                    toolkit: app["sbg:toolkit"],
                    openHandler: _ => {
                        this.eventHub.publish(new OpenTabAction({
                            id: app.id,
                            title: Observable.of(app.label),
                            contentType: Observable.of(app.class),
                            contentData: {
                                data: app,
                                isWritable: false,
                                content: this.platform.getAppCWL(app).switchMap(cwl => new BehaviorSubject(cwl)),
                                language: Observable.of("json")
                            }
                        }));
                    }
                };

            }).reduce((acc, app: PlatformAppEntry) => {
                //noinspection TypeScriptUnresolvedVariable
                acc[app.toolkit] = [].concat.apply(acc[app.toolkit] || [], [app]);
                return acc;
            }, {});

            const noToolkits = categorized["undefined"] || [];
            delete categorized["undefined"];


            const nodes = Object.keys(categorized).map(key => ({
                name: key,
                icon: "angle",
                isExpandable: true,
                childrenProvider: _ => Observable.of(categorized[key])
            })).concat(noToolkits);

            return nodes;

        })).subscribe(categories => {
            this.nodes = categories;
        });
    }

}