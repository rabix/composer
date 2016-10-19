import {Component} from "@angular/core";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {ReplaySubject, Observable, Subscription} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {PanelToolbarComponent} from "./panel-toolbar.component";
import {SBPlatformDataSource} from "../../sources/sbg";
import {OpenTabAction} from "../../action-events";
import {DataEntrySource} from "../../sources/common/interfaces";
import {SettingsService} from "../../services/settings/settings.service";

@Component({
    selector: "ct-sb-user-projects-panel",
    directives: [TreeViewComponent, BlockLoaderComponent, PanelToolbarComponent],
    host: {class: "block"},
    template: `
        <ct-panel-toolbar>
            <name>Projects</name>
        </ct-panel-toolbar>
        
        <div *ngIf="isLoading">
             <div class="text-xs-center"><small>Preparing Your Projects&hellip;</small></div>
            <progress class="progress progress-striped progress-animated" value="100" max="100"></progress>
        </div>
            
        <ct-tree-view [nodes]="nodes | async"></ct-tree-view>
    `
})
export class SBUserProjectsPanelComponent {

    private nodes = new ReplaySubject(1);

    private isLoading = false;

    private subs: Subscription[] = [];

    constructor(private dataSource: SBPlatformDataSource,
                private eventHub: EventHubService,
                private settings: SettingsService) {

        this.subs.push(
            this.settings.platformConfiguration
                .do(_ => this.isLoading = true)
                .flatMap(_ => {

                    return this.dataSource.load().map(entries => {
                        return entries.map(entry => ({
                            name: entry.data.name,
                            icon: entry.type || "angle",
                            isExpandable: true,
                            childrenProvider: _ => entry.childrenProvider()
                                .map(childrenApps => childrenApps.map((source: DataEntrySource) => ({
                                    name: source.data.label,
                                    icon: source.data.class || "file",
                                    openHandler: _ => {
                                        this.eventHub.publish(new OpenTabAction({
                                            id: source.data.class + "_" + source.data.label,
                                            title: Observable.of(source.data.label),
                                            contentType: Observable.of(source.data.class),
                                            contentData: source
                                        }));
                                    }
                                })))
                        }))
                    })
                }).subscribe(data => {
                this.isLoading = false;
                this.nodes.next(data);
            }, err => {
                this.isLoading = false;
            })
        );
    }

    ngOnInit() {

    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

}