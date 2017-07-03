import {Component} from "@angular/core";
import {AuthService} from "../../../auth/auth.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

const {app, dialog} = window["require"]("electron").remote;

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
                    <button class="btn btn-secondary" (click)="selectLocalFolders()">Select a Folder...</button>
                </p>
            </div>

            <!--If we want to add a platform projects, we may have multiple steps-->
            <ng-container *ngIf="activeTab === 'platform'">

                <!--If we have an active connection we should show the choice of projects to add-->
                <div class="dialog-content dialog-connection" *ngIf="auth.active | async; else noActiveConnection">

                    <!--Projects are loaded-->
                    <ng-container *ngIf="closedProjectOptions; else projectsNotLoadedYet">

                        <!--Offer projects so users can choose which to add-->
                        <div *ngIf="closedProjectOptions.length > 0; else allProjectsAreAdded">
                            <p>Choose projects to add to the workspace:</p>
                            <div>
                                <ct-auto-complete [(ngModel)]="selectedProjects" [options]="closedProjectOptions"></ct-auto-complete>
                            </div>
                        </div>

                    </ng-container>


                </div>
            </ng-container>

            <ng-template #noActiveConnection>

                <div *ngIf="(auth.getCredentials() | async).length === 0; else platformActivation" class="dialog-content dialog-centered">
                    User has no platforms listed
                </div>

            </ng-template>

            <ng-template #platformActivation>
                <div class="dialog-content dialog-centered">
                    User has platforms listed but no connected ones.
                </div>
            </ng-template>

            <ng-template #projectsNotLoadedYet>
                Loading projects...
            </ng-template>

            <ng-template #allProjectsAreAdded>
                All your projects are added to the workspace.
            </ng-template>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="button" class="btn btn-primary" [disabled]="selectedProjects.length === 0" (click)="onDone()">Done</button>
            </div>
        </div>
    `,
})
export class AddSourceModalComponent extends DirectiveBase {

    activeTab         = "local";
    selectedProjects  = [];
    localFoldersToAdd = [];
    closedProjectOptions: { value: string, text: string }[];

    constructor(public modal: ModalService,
                private localRepository: LocalRepositoryService,
                private repository: PlatformRepositoryService,
                public auth: AuthService) {

        super();

        this.repository.getClosedProjects().subscribeTracked(this, (projects) => {
            this.closedProjectOptions = projects.map(project => {
                return {
                    value: project.id,
                    text: project.name
                }
            });
        });
    }

    onDone() {

        this.auth.getActive().take(1).subscribeTracked(this, (activePlatform) => {
            if (!activePlatform) {
                throw new Error("Trying to open a project, but there is no active platform set.");
            }

            this.repository.addOpenProjects(...this.selectedProjects).then(() => {
                this.modal.close();
            });

        });
    }

    selectLocalFolders() {
        dialog.showOpenDialog({
            title: "Choose a Directory",
            defaultPath: app.getPath("home"),
            buttonLabel: "Add to Workspace",
            properties: ["openDirectory", "multiSelections"]
        }, (paths) => {
            this.localFoldersToAdd = paths || [];
            this.localRepository.addLocalFolders(...paths);
            this.modal.close();
        });
    }
}
