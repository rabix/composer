import {Observable, BehaviorSubject} from "rxjs";
import {Component} from "@angular/core";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {PlatformAppEntry} from "../../services/api/platforms/platform-api.types";
import {SettingsService} from "../../services/settings/settings.service";
import {PublicAppService} from "../../platform-providers/public-apps/public-app.service";
import {WorkboxService} from "../workbox/workbox.service";
import {StatusBarService} from "../../core/status-bar/status-bar.service";
@Component({
    selector: "ct-sb-public-apps-panel",
    host: {class: "block"},
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Public Apps</span>
        </ct-panel-toolbar>
        
        <div *ngIf="isLoading">
            <div class="text-xs-center"><small>Fetching Public Apps&hellip;</small></div>
        </div>
        <ct-tree-view [nodes]="nodes" [preferenceKey]="'public-apps'"></ct-tree-view>
    `
})
export class SBPublicAppsPanelComponent {

    public nodes = [];

    public isLoading = false;

    constructor(private platform: PlatformAPI,
                private workbox: WorkboxService,
                private settings: SettingsService,
                private statusBar: StatusBarService,
                private contextMenu: PublicAppService) {
    }

    ngOnInit() {

        const sortingMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase());

        let statusProcessID;

        this.settings.platformConfiguration
            .do(_ => {
                this.isLoading = true;
                statusProcessID = this.statusBar.startProcess("Fetching public apps...");
            })
            .flatMap(_ => this.platform.getPublicApps().map(apps => {
                const categorized = apps.map(app => {

                    const content = Observable.of(1)
                        .switchMap(_ => this.platform.getAppCWL(app))
                        .switchMap(cwl => new BehaviorSubject(cwl));

                    return {
                        name: `${app.label} ${app["sbg:toolkitVersion"]}`.trim(),
                        icon: app.class || "file",
                        isExpandable: false,
                        content,
                        contextMenu: this.contextMenu.getContextMenu(app.label, content),
                        openHandler: _ => {
                            this.workbox.openTab({
                                id: app.id,
                                title: Observable.of(app.label),
                                contentType: Observable.of(app.class),
                                contentData: {
                                    data: app,
                                    isWritable: false,
                                    content,
                                    language: Observable.of("json")
                                }
                            });
                        }
                    };

                }).reduce((acc, app: PlatformAppEntry) => {
                    //noinspection TypeScriptUnresolvedVariable
                    acc[app["sbg:toolkit"]] = [].concat.apply(acc[app["sbg:toolkit"]] || [], [app]);
                    return acc;
                }, {});

                const noToolkits = (categorized["undefined"] || []).sort(sortingMethod);
                delete categorized["undefined"];


                return Object.keys(categorized).map(key => ({
                    id: key,
                    name: key,
                    icon: "angle",
                    isExpandable: true,
                    childrenProvider: _ => Observable.of(categorized[key])
                })).sort(sortingMethod).concat(noToolkits.sort(sortingMethod));

            })).subscribe(categories => {
            this.isLoading = false;
            this.nodes     = categories;

            this.statusBar.stopProcess(statusProcessID, "Fetched public apps");
        }, err => {
            this.isLoading = false;
        });
    }
}
