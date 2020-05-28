import {Component, Input} from "@angular/core";
import {AuthService} from "../../../auth/auth.service";
import {NativeSystemService} from "../../../native/system/native-system.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {WorkboxService} from "../../workbox/workbox.service";
import {PlatformCredentialsModalComponent} from "../platform-credentials-modal/platform-credentials-modal.component";
import {catchError, map, take, tap, withLatestFrom} from "rxjs/operators";
import {Project} from "../../../../../electron/src/sbg-api-client/interfaces";
import {of} from "rxjs/observable/of";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";

@Component({
    selector: "ct-add-source-modal",
    styleUrls: ["./add-source-modal.component.scss"],
    template: `
        <div class="header">
            <ct-tab-selector [distribute]="'auto'" [(active)]="activeTab">
                <ct-tab-selector-entry tabName="local" data-test="local-tab">Local</ct-tab-selector-entry>
                <ct-tab-selector-entry tabName="platform" data-test="platform-tab">Platform</ct-tab-selector-entry>
            </ct-tab-selector>
        </div>

        <div class="body">

            <!--If we are on the local tab, we just need a button to choose a folder and that's it-->
            <div *ngIf="activeTab === 'local'" class="dialog-centered dialog-content">
                <p>Add one or more folders from your computer to the workspace.</p>
                <p>
                    <button class="btn btn-secondary" (click)="selectLocalFolders()">Select a Folder</button>
                </p>
            </div>

            <!--If we want to add a platform projects, we may have multiple steps-->
            <ng-container *ngIf="activeTab === 'platform'">

                <!--If we have an active connection we should show the choice of projects to add-->
                <div class="dialog-content dialog-connection" *ngIf="auth.active | async; else noActiveConnection">

                    <p>Choose projects to add to your workspace:</p>
                    <div>
                        <ct-auto-complete data-test="add-source-modal-add-project"
                                          [(ngModel)]="selectedProjects"
                                          [searchFn]="searchProjectsFn()"></ct-auto-complete>
                    </div>

                </div>
            </ng-container>

            <ng-template #noActiveConnection>

                <div class="dialog-content dialog-centered">
                    <div *ngIf="(auth.getCredentials() | async ).length > 0; else noUsers">
                        <p>Go to
                            <a href="" (click)="openSettingsTab(); false;">settings page</a>
                            and choose an active user in order to add projects to your workspace
                        </p>
                    </div>
                </div>

            </ng-template>

            <ng-template #noUsers>
                <p>You are not connected to any platform</p>
                <p>
                    <button type="button"
                            data-test="add-source-modal-connection-button"
                            class="btn btn-primary"
                            (click)="openCredentialsForm()">
                        Add an Account
                    </button>
                </p>
            </ng-template>

            <ng-template #projectsNotLoadedYet>
                Loading projects...
            </ng-template>

            <ng-template #allProjectsAreAdded>
                All your projects are added to the workspace.
            </ng-template>
            
            <ng-template #userHasNoProjects>
                You have no projects.
            </ng-template>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-test="add-source-modal-cancel-button" (click)="modal.close()">Cancel
                </button>
                <button type="button" class="btn btn-primary" data-test="add-source-modal-apply-button"
                        [disabled]="selectedProjects.length === 0"
                        (click)="onDone()">Done
                </button>
            </div>
        </div>
    `,
})
export class AddSourceModalComponent extends DirectiveBase {

    @Input()
    activeTab: "local" | "platform" = "local";

    selectedProjects  = [];
    localFoldersToAdd = [];

    constructor(public modal: ModalService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService,
                private workbox: WorkboxService,
                private native: NativeSystemService,
                public auth: AuthService,
                public statusBar: StatusBarService
    ) {
        super();
    }

    onDone() {

        this.auth.getActive().pipe(
            take(1)
        ).subscribeTracked(this, (activePlatform) => {
            if (!activePlatform) {
                throw new Error("Trying to open a project, but there is no active platform set.");
            }

            this.platformRepository.addOpenProjects(this.selectedProjects, true).then(() => {
                const process = this.statusBar.startProcess("Fetching apps for projects. You might not see up-to-date information while sync is in progress.");
                this.platformRepository.fetchAppsForProjects(this.selectedProjects)
                    .pipe(take(1))
                    .subscribe(() => {
                        this.statusBar.stopProcess(process, "Fetched Apps");
                    }, () => {
                        this.statusBar.stopProcess(process, "Failed to fetch Apps");
                    });

                this.modal.close();
            });

        });
    }

    selectLocalFolders() {
        this.native.openFolderChoiceDialog({
            buttonLabel: "Add to Workspace"
        }, true).then(paths => {
            this.localFoldersToAdd = paths;
            this.localRepository.addLocalFolders(paths, true).then(() => {
                this.modal.close();
            });
        }).catch(() => {
        });

    }

    openCredentialsForm() {
        const modal = this.modal.fromComponent(PlatformCredentialsModalComponent, "Add an Account");

        modal.submit.pipe(
            take(1)
        ).subscribe(() => {
            this.modal.close();
        });
    }

    openSettingsTab() {
        this.workbox.openSettingsTab();
        this.modal.close();
    }

    searchProjectsFn() {
        const cache = this.platformRepository.getProjects();

        const cacheAllSearchedProjects = (projects) => of(projects)
            .pipe(
                withLatestFrom(cache),
                map(([searchedProjects, cachedProjects]) => {
                    const allWithLatest = [...cachedProjects, ...searchedProjects];
                    const cacheMap = new Map();

                    allWithLatest.forEach(project => cacheMap.set(project.id, project));

                    return Array.from(cacheMap.values());
                })
            ).subscribe(allProjects => {
                this.platformRepository.setProjects(allProjects);
            }).unsubscribe();

        return (query: string) => {
            return this.platformRepository.searchProjects(query)
                .pipe(
                    catchError(() => []),
                    tap<Project[]>(projects => {
                        cacheAllSearchedProjects(projects);
                    }),
                    map<Project[], Array<{ value: string, text: string }>>(projects => {
                        return projects.map(p => ({
                            value: p.id,
                            text: p.name
                        }));
                    })
                );
        };
    }
}
