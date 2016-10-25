import {Component} from "@angular/core";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {ReplaySubject, Observable, Subscription, Subject} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {PanelToolbarComponent} from "./panel-toolbar.component";
import {OpenTabAction} from "../../action-events";
import {DataEntrySource} from "../../sources/common/interfaces";
import {SettingsService} from "../../services/settings/settings.service";
import {SBPlatformDataSourceService} from "../../sources/sbg/sb-platform.source.service";
import {PlatformProjectEntry} from "../../services/api/platforms/platform-api.types";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

@Component({
    selector: "ct-sb-user-projects-panel",
    directives: [TreeViewComponent, BlockLoaderComponent, PanelToolbarComponent],
    host: {class: "block"},
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Projects</span>
            <span class="tc-tools clickable">
                <i *ngIf="(closedProjects | async)?.length"
                   (click)="showProjectSelectionToolbar = true"
                   class="fa fa-fw fa-plus-circle"></i>
            </span>
        </ct-panel-toolbar>
        
        <div class="project-selector-container" *ngIf="showProjectSelectionToolbar && (closedProjects | async)?.length">
            <form class="form-inline" 
                  #form 
                  (submit)="addProjectToWorkspace(projectSelection.value)">
        
                <div class="input-group project-selection-input-group">
                    <select #projectSelection class="project-selector form-control custom-select" required>
                        <option value="" disabled [selected]="true">Choose a Project...</option>
                        <option *ngFor="let p of (closedProjects | async)" [value]="p.id">{{ p.name }}</option>
                    </select>
                    <span class="input-group-btn ">
                        <button class="btn project-selection-submit-button" type="submit">+</button>
                    </span>
                </div>
            </form>
        </div>
        
        <div *ngIf="isLoading">
            <div class="text-xs-center">
                <small>Preparing Your Projects&hellip;</small>
            </div>
            <progress class="progress progress-striped progress-animated" value="100" max="100"></progress>
        </div>
        
        <ct-tree-view [nodes]="nodes | async"></ct-tree-view>
    `
})
export class SBUserProjectsPanelComponent {

    private nodes = new ReplaySubject(1);

    private isLoading = false;

    private subs: Subscription[] = [];

    private allProjects = new ReplaySubject<{id: string, data: PlatformProjectEntry}>();

    private openProjects = new ReplaySubject(1);

    private closedProjects = new ReplaySubject(1);

    private projectUpdates = new Subject();

    private showProjectSelectionToolbar = false;

    constructor(private dataSource: SBPlatformDataSourceService,
                private eventHub: EventHubService,
                private preferences: UserPreferencesService,
                private settings: SettingsService) {

        this.settings.platformConfiguration
            .do(_ => this.isLoading = true)
            .flatMap(_ => this.dataSource.getProjects())
            .map(projects => projects
                .sort((a, b) => a.data.name.toLowerCase().localeCompare(b.data.name.toLowerCase()))
                .map(entry => this.mapProjectToNode(entry))
            ).withLatestFrom(

            this.settings.platformConfiguration,
            Observable.of(this.preferences.get("open_projects", {})),

            (allProjects, config, openProjectPrefs) => {
                return allProjects.map(p => Object.assign(p, {
                    isOpen: (openProjectPrefs[config.url] || []).indexOf(p.id) !== -1
                }));
            })
            .subscribe(this.allProjects);

        this.allProjects.map(projects => {
            return projects.reduce((acc, curr) => {
                acc[curr.isOpen ? "open" : "closed"].push(curr);
                return acc;
            }, {open: [], closed: []})
        })
            .subscribe(groups => {

                this.openProjects.next(groups.open);
                this.closedProjects.next(groups.closed);
            });

        this.openProjects
            .withLatestFrom(this.settings.platformConfiguration, (nodes, conf) => ({nodes, conf}))
            .subscribe(data => {
                this.isLoading = false;
                this.nodes.next(data.nodes);
                const openPrefs = this.preferences.get("open_projects", {});
                this.preferences.put("open_projects", Object.assign(openPrefs, {
                    [data.conf.url]: data.nodes.map(n => n.id)
                }))

            });

        this.projectUpdates.withLatestFrom(this.allProjects, (update, projects) => update(projects))
            .subscribe(this.allProjects);

    }

    private mapProjectToNode(project) {
        return {
            id: project.data.id,
            name: project.data.name,
            icon: project.type || "angle",
            isExpandable: true,
            onClose: () =>{
                this.setProjectStatus(project.data.id, false);
            },
            childrenProvider: _ => project.childrenProvider()
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
        }
    }


    private setProjectStatus(projectID, isOpen) {
        this.projectUpdates.next(
            (allProjects) => allProjects.map(project => {
                if (project.id === projectID) {
                    return Object.assign({}, project, {isOpen});
                }

                return project;
            }));
    }

    private addProjectToWorkspace(projectID){
        this.setProjectStatus(projectID, true);
        this.showProjectSelectionToolbar = false;
    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

}