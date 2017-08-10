import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../auth/auth.service";
import {AuthCredentials} from "../../../auth/model/auth-credentials";
import {NativeSystemService} from "../../../native/system/native-system.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {GlobalService} from "../../global/global.service";
import {WorkboxService} from "../../workbox/workbox.service";
import {PlatformCredentialsModalComponent} from "../platform-credentials-modal/platform-credentials-modal.component";

@Component({
    selector: "ct-add-source-modal",
    styleUrls: ["./add-source-modal.component.scss"],
    template: `
        <div class="header">
            <ct-tab-selector [distribute]="'auto'" [(active)]="activeTab">
                <ct-tab-selector-entry tabName="local">Local</ct-tab-selector-entry>
                <ct-tab-selector-entry tabName="platform">Platform</ct-tab-selector-entry>
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

                    <!--Projects are loaded-->
                    <ng-container *ngIf="(platformRepository.getProjects() | async) !== null; else projectsNotLoadedYet">

                        <!--Offer projects so users can choose which to add-->
                        <div *ngIf="closedProjectOptions.length > 0; else allProjectsAreAdded">
                            <p>Choose projects to add to the workspace:</p>
                            <div>
                                <ct-auto-complete [(ngModel)]="selectedProjects"
                                                  [options]="closedProjectOptions"></ct-auto-complete>
                            </div>
                        </div>

                    </ng-container>


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
                    <button type="button" class="btn btn-primary" (click)="openCredentialsForm()">Add a connection
                    </button>
                </p>
            </ng-template>

            <ng-template #projectsNotLoadedYet>
                Loading projects...
            </ng-template>

            <ng-template #allProjectsAreAdded>
                All your projects are added to the workspace.
            </ng-template>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="button" class="btn btn-primary" [disabled]="selectedProjects.length === 0"
                        (click)="onDone()">Done
                </button>
            </div>
        </div>
    `,
})
export class AddSourceModalComponent extends DirectiveBase {

    activeTab                                               = "local";
    selectedProjects                                        = [];
    localFoldersToAdd                                       = [];
    closedProjectOptions: { value: string, text: string }[] = null;

    constructor(public modal: ModalService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService,
                private workbox: WorkboxService,
                private global: GlobalService,
                private native: NativeSystemService,
                public auth: AuthService) {

        super();

        this.platformRepository.getClosedProjects()
            .map(p => p || [])
            .subscribeTracked(this, projects => {
                this.closedProjectOptions = projects.map(project => {
                    return {
                        value: project.id,
                        text: project.name
                    };
                });
            });
    }

    onDone() {

        this.auth.getActive().take(1).subscribeTracked(this, (activePlatform) => {
            if (!activePlatform) {
                throw new Error("Trying to open a project, but there is no active platform set.");
            }

            this.platformRepository.addOpenProjects(...this.selectedProjects).then(() => {
                this.modal.close();
            });

        });
    }

    selectLocalFolders() {
        this.native.openFolder({
            buttonLabel: "Add to Workspace"
        }, true).then(paths => {
            this.localFoldersToAdd = paths;
            this.localRepository.addLocalFolders(...paths);
            this.modal.close();
        }, () => {
        });

    }

    openCredentialsForm() {
        const credentialsModal = this.modal.fromComponent(PlatformCredentialsModalComponent, {
            title: "Add Connection"
        });

        credentialsModal.submit = () => {
            const valuesFromModal = credentialsModal.getValue();
            Observable.fromPromise(this.auth.addCredentials(valuesFromModal)).withLatestFrom(this.auth.getCredentials())
                .take(1).subscribe((combined) => {
                const credentials = combined[1];

                // If added credential is the only one, set it to be the active one
                if (credentials.length === 1) {
                    this.setActiveCredentials(credentials[0]);
                }
            });
            this.modal.close();
        };

    }

    setActiveCredentials(credentials: AuthCredentials) {

        this.auth.setActiveCredentials(credentials).then(() => {
            if (credentials) {
                this.global.reloadPlatformData();
            }
            this.workbox.forceReloadTabs();
        });
    }

    openSettingsTab() {
        this.workbox.openSettingsTab();
        this.modal.close();
    }
}
