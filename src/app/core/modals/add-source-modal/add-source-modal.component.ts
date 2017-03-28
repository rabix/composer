import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {SettingsService} from "../../../services/settings/settings.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {AuthService} from "../../../auth/auth/auth.service";
import {Observable} from "rxjs/Observable";
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
                    <strong>Add one or more folders from your computer to the workspace</strong>
                </p>
                <div>
                    <button class="btn btn-secondary" (click)="selectLocalFolders()">Select a Folder...</button>
                </div>
            </div>

            <div class="dialog-connection dialog-content" *ngIf="activeTab === 'platform' && !isConnected && !connecting">
                <p>
                    <strong>Connect to the Seven Bridges Platform</strong>
                </p>

                <ct-credentials-form #credsForm [removable]="false"></ct-credentials-form>
                <p>
                    <button type="button" class="btn btn-success" (click)="credsForm.applyValues(); connecting = true;">Connect</button>
                </p>
            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && connecting ">
                <p>
                    <strong>Checking your connection to the platform...</strong>
                    <ct-line-loader></ct-line-loader>
                </p>
            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && isConnected && !loadedProjects">
                <p>
                    <strong>Fetching your projects...</strong>
                    <ct-line-loader></ct-line-loader>
                </p>
            </div>

            <div class="dialog-connection dialog-content"
                 *ngIf="activeTab === 'platform' && isConnected && loadedProjects && nonAddedUserProjects.length">
                <p>
                    <strong>Add Projects to the Workspace</strong>
                </p>
                <div>
                    <ct-auto-complete [(ngModel)]="selectedProjects"
                                      [options]="nonAddedUserProjects"
                                      [optgroups]="platformOptgroups"
                                      optgroupField="hash">

                    </ct-auto-complete>
                    <!--<select multiple class="form-control" [formControl]="projectSelectionControl">-->
                    <!--<option *ngFor="let project of nonAddedUserProjects" [value]="project.value">{{ project.label }}</option>-->
                    <!--</select>-->
                </div>
            </div>

            <div class="dialog-connection"
                 *ngIf="activeTab === 'platform' && isConnected && loadedProjects && nonAddedUserProjects.length === 0">
                <p>
                    <strong>You have added all your projects to the workspace.</strong>
                </p>
            </div>


            <div class="footer pr-1 pb-1">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="button" class="btn btn-success"
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

    localFoldersToAdd = [];

    loadedProjects = false;

    isConnected = false;

    connecting = true;

    selectedProjects = [];

    platformOptgroups = [];

    constructor(private auth: AuthService,
                private data: DataGatewayService,
                public modal: ModalService,
                private preferences: UserPreferencesService) {

        super();

        this.tracked = auth.connections
            .flatMap((credentials: any) => {
                const listings = credentials.map(creds => this.data.getPlatformListing(creds.hash));

                if (listings.length === 0) {
                    return Observable.of([]);
                }

                return Observable.zip(...listings);
            }, (credentials, listings) => ({credentials, listings}))
            .withLatestFrom(
                this.preferences.getOpenProjects(),
                (data, openProjects) => ({...data, openProjects}))
            .subscribe(data => {
                console.log("Again data", data);
                this.connecting = false;

                const {credentials, listings, openProjects} = data;
                this.platformOptgroups                      = credentials.map(creds => ({value: creds.hash, label: creds.profile}));
                this.nonAddedUserProjects                   = listings.reduce((acc, listing, index) => {
                    return acc.concat(listing.map((entry: any) => {
                        return {
                            value: credentials[index].hash + `/${entry.owner}/${entry.slug}`,
                            text: entry.name,
                            hash: credentials[index].hash
                        } as any;
                    }));
                }, []).filter((entry: any) => openProjects.indexOf(entry.value) === -1);

                this.isConnected    = data.credentials.length > 0;
                this.loadedProjects = true;
            });
    }


    ngOnInit() {

    }

    onDone() {
        if (this.activeTab === "platform" && this.loadedProjects) {
            const val = this.selectedProjects;
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
        this.isConnected = true;
    }

    selectLocalFolders() {
        dialog.showOpenDialog({
            title: "Choose a Directory",
            defaultPath: app.getPath("home"),
            buttonLabel: "Add to Workspace",
            properties: ["openDirectory", "multiSelections"]
        }, (paths) => {
            this.localFoldersToAdd = paths || [];
            this.onDone();
        });
    }


}
