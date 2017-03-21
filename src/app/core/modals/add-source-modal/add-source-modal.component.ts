import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {SettingsService} from "../../../services/settings/settings.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {ModalService} from "../../../ui/modal/modal.service";
const {app, dialog} = window["require"]("electron").remote;

@Component({
    selector: "ct-add-source-modal",
    template: `
        <div class="header">
            <ct-tab-selector [distribute]="'auto'" [(active)]="activeTab" class="inverse">
                <ct-tab-selector-entry tabName="local">Local</ct-tab-selector-entry>
                <ct-tab-selector-entry tabName="platform">Platform</ct-tab-selector-entry>
            </ct-tab-selector>
        </div>
        <div class="body">
            <div class="dialog-centered dialog-content" *ngIf="activeTab === 'local' && localFoldersToAdd.length === 0">
                <p>
                    <strong>Add a folder from your computer to the workspace</strong>
                </p>
                <div>
                    <button class="btn btn-secondary" (click)="selectLocalFolders()">Select a Folder...</button>
                </div>
            </div>

            <div class="dialog-connection dialog-content"
                 *ngIf="activeTab === 'local' && localFoldersToAdd.length ">
                <p>
                    <strong>Add these folders your workspace:</strong>
                </p>
                <ul class="folder-list pl-2">
                    <li *ngFor="let f of localFoldersToAdd">{{ f }}</li>
                </ul>
            </div>

            <div class="dialog-connection dialog-content" *ngIf="activeTab === 'platform' && projectStep === 'connect'">
                <p>
                    <strong>Connect to the Seven Bridges Platform</strong>
                </p>
                <ct-platform-connection-form (submission)="onConnectionSubmission($event)"></ct-platform-connection-form>
            </div>


            <div class="dialog-connection dialog-content"
                 *ngIf="activeTab === 'platform' && projectStep === 'add' && nonAddedUserProjects.length">
                <p>
                    <strong>Add Projects to the Workspace</strong>
                </p>
                <div>
                    <select multiple class="form-control" [formControl]="projectSelectionControl">
                        <option *ngFor="let project of nonAddedUserProjects" [value]="project.value">{{ project.label }}</option>
                    </select>
                </div>

            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && projectStep === 'checking-apps'">
                <p>
                    <strong>Fetching your projects...</strong>
                    <ct-block-loader></ct-block-loader>
                </p>
            </div>
            <div class="dialog-connection" *ngIf="activeTab === 'platform' && projectStep === 'checking-connection'">
                <p>
                    <strong>Checking your connection to the platform...</strong>
                    <ct-block-loader></ct-block-loader>
                </p>
            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && projectStep === 'add' && nonAddedUserProjects.length === 0">
                <p>
                    <strong>You have added all your projects to the workspace.</strong>
                </p>
            </div>


            <div class="footer pr-1 pb-1">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="button" class="btn btn-success"
                        [disabled]="projectStep !== 'add'"
                        (click)="onDone()">Done
                </button>
            </div>
        </div>
    `,
    styleUrls: ["./add-source-modal.component.scss"],
})
export class AddSourceModalComponent extends DirectiveBase implements OnInit {

    activeTab = "local";

    projectStep: "connect" |
        "add" |
        "checking-connection" |
        "confirm-local-folders" |
        "checking-apps" = "checking-connection";

    nonAddedUserProjects = [];

    projectSelectionControl = new FormControl();

    localFoldersToAdd = [];

    constructor(settings: SettingsService,
                data: DataGatewayService,
                public modal: ModalService,
                private preferences: UserPreferencesService) {

        super();

        const validity = settings.validity;
        this.tracked   = validity.take(1).subscribe(isValid => {
            this.projectStep = isValid ? "checking-apps" : "connect";
        });

        this.tracked = data.scanCompletion
            .flatMap(_ => settings.platformConfiguration)
            .flatMap(config => {
                const profile = SettingsService.urlToProfile(config.url);
                return preferences.get(`dataCache.${profile}`, {projects: []})
                    .map(cache => ({cache, profile}))
                    .do(_ => console.log("Received data cache for", profile))
            })
            .withLatestFrom(preferences.get("openProjects", []),
                (cacheData: any, openProjects) => {
                    return {
                        profile: cacheData.profile,
                        projects: cacheData.cache.projects,
                        openProjects
                    };
                })
            .subscribe(stuff => {

                this.nonAddedUserProjects = stuff.projects.filter(p => {
                    return stuff.openProjects.indexOf(`${stuff.profile}/${p.slug}`) === -1;
                }).map(p => ({
                    value: stuff.profile + "/" + p.slug,
                    label: p.name
                }));

                this.projectStep = "add";
            });
    }

    ngOnInit() {

    }

    onDone() {
        if (this.activeTab === "platform" && this.projectStep === "add") {
            const val = this.projectSelectionControl.value;
            if (val && val.length) {
                this.preferences.get("openProjects", []).take(1).map(set => {
                    return set.concat(val).filter((v, i, a) => a.indexOf(v) === i);
                }).subscribe(newSet => {
                    this.preferences.put("openProjects", newSet);
                    this.modal.close();
                });
            } else {
                this.modal.close();
            }
            return;
        }

        if (this.activeTab === "local" && this.localFoldersToAdd.length) {
            this.preferences.get("localFolders", []).take(1).map(set => {
                return set.concat(this.localFoldersToAdd).filter((v, i, a) => a.indexOf(v) === i);
            }).subscribe(newSet => {
                this.preferences.put("localFolders", newSet);
                this.modal.close();
            });
        }
    }

    onConnectionSubmission(val) {
        this.projectStep = "add";
    }

    selectLocalFolders() {
        dialog.showOpenDialog({
            title: "Choose a Directory",
            defaultPath: app.getPath("home"),
            buttonLabel: "Add to Workspace",
            properties: ["openDirectory", "multiSelections"]
        }, (paths) => {
            this.localFoldersToAdd = paths;
        });
    }


}
