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
    host: {class: "block"},
    template: `
        <ct-panel-toolbar>
            <name>Public Apps</name>
        </ct-panel-toolbar>
        
        <div *ngIf="isLoading">
             <div class="text-xs-center"><small>Fetching Public Apps&hellip;</small></div>
            <progress class="progress progress-striped progress-animated" value="100" max="100"></progress>
        </div>
        <ct-tree-view [nodes]="nodes"></ct-tree-view>
    `
})
export class SBPublicAppsPanelComponent {

    private nodes = [];

    private isLoading = false;

    constructor(private platform: PlatformAPI,
                private eventHub: EventHubService,
                private settings: SettingsService) {
    }

    ngOnInit() {

        const sortingMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());

        this.settings.platformConfiguration
            .do(_ => this.isLoading = true)
            .flatMap(_ => this.platform.getPublicApps().map(apps => {


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

                const noToolkits = (categorized["undefined"] || []).sort(sortingMethod);
                delete categorized["undefined"];


                const nodes = Object.keys(categorized).map(key => ({
                    name: key,
                    icon: "caret",
                    isExpandable: true,
                    childrenProvider: _ => Observable.of(categorized[key])
                })).sort(sortingMethod).concat(noToolkits.sort(sortingMethod));

                return nodes;

            })).subscribe(categories => {
            this.isLoading = false;
            this.nodes     = categories;
        }, err => {
            this.isLoading = false;
        });
    }

}