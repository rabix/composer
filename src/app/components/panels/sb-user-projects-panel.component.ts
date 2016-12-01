import {Component} from "@angular/core";
import {ReplaySubject, Observable, Subscription, Subject} from "rxjs";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {OpenTabAction} from "../../action-events";
import {DataEntrySource} from "../../sources/common/interfaces";
import {SettingsService} from "../../services/settings/settings.service";
import {SBPlatformDataSourceService} from "../../sources/sbg/sb-platform.source.service";
import {PlatformProjectEntry} from "../../services/api/platforms/platform-api.types";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {MenuItem} from "../menu/menu-item";
import {ModalService} from "../modal/modal.service";
import {NewFileModalComponent} from "../modal/custom/new-file-modal.component";
import {ProjectSelectionModal} from "../modal/custom/project-selection-modal.component";
import {ComponentBase} from "../common/component-base";

@Component({
    selector: "ct-sb-user-projects-panel",
    host: {"class": "block"},
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Projects</span>
            <span class="tc-tools clickable">
                <i *ngIf="(closedProjects | async)?.length"
                   (click)="openProjectSelectionModal()"                   
                   class="fa fa-fw fa-plus-circle"></i>
            </span>
        </ct-panel-toolbar>
        
        <div *ngIf="!isLoading && (openProjects | async)?.length === 0"
             class="alert alert-info m-1">
             <i class="fa fa-info-circle alert-icon"></i>
            There are no open projects. Select projects to open by clicking the plus above.
        </div>
        
        <div *ngIf="isLoading">
            <div class="text-xs-center">
                <small>Preparing Your Projects&hellip;</small>
            </div>
            <progress class="progress progress-striped progress-animated" value="100" max="100"></progress>
        </div>
        
        <ct-tree-view [nodes]="nodes | async" [preferenceKey]="'user-projects'"></ct-tree-view>
    `
})
export class SBUserProjectsPanelComponent extends ComponentBase {

    private nodes = new ReplaySubject(1);

    private isLoading = false;

    private allProjects = new ReplaySubject<{id: string, data: PlatformProjectEntry}>();

    private openProjects = new ReplaySubject(1);

    private closedProjects = new ReplaySubject(1);

    private projectUpdates = new Subject();

    constructor(private dataSource: SBPlatformDataSourceService,
                private eventHub: EventHubService,
                private preferences: UserPreferencesService,
                private modal: ModalService,
                private settings: SettingsService) {
        super();

        this.settings.platformConfiguration
            .do(_ => this.isLoading = true)
            .flatMap(_ => this.dataSource.getProjects())
            .map(projects => projects
                .sort((a, b) => a.data.name.toLowerCase().localeCompare(b.data.name.toLowerCase()))
                .map(entry => this.mapProjectToNode(entry))
            ).withLatestFrom(
            this.settings.platformConfiguration,
            this.preferences.get("open_projects", {}),

            (allProjects, config, openProjectPrefs) => {
                return allProjects.map(p => Object.assign(p, {
                    isOpen: (openProjectPrefs[config.url] || []).indexOf(p.id) !== -1
                }));
            })
            .subscribe(this.allProjects);

        this.allProjects.map((projects: any[]) => {
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
            .withLatestFrom(this.preferences.get("open_projects", {}),
                this.settings.platformConfiguration, (nodes, projects, conf) => ({nodes, projects, conf}))
            .subscribe(data => {
                this.isLoading = false;
                this.nodes.next(data.nodes);
                this.preferences.put("open_projects", Object.assign(data.projects, {
                    [data.conf.url]: data.nodes.map(n => n.id)
                }));
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
            contextMenu: [
                new MenuItem("New App...", {
                    click: () => this.openNewFileModal(project.data)
                }),
                new MenuItem("Remove from Workspace")
            ],
            onClose: () => {
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

    private openNewFileModal(project: PlatformProjectEntry) {
        const component = this.modal.show<NewFileModalComponent>(NewFileModalComponent, {
            title: "Create new File...",
            closeOnOutsideClick: true,
            closeOnEscape: true
        });
    }

    private openProjectSelectionModal() {
        const component = this.modal.show<ProjectSelectionModal>(ProjectSelectionModal, {
            title: "Open Project",
            closeOnOutsideClick: true,
            closeOnEscape: true
        });

        component.closedProjects = this.closedProjects;
        component.save = (projectID) => {
            this.setProjectStatus(projectID, true);
            this.allProjects.first().subscribe(x => component.closeModal());
        };
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
}
