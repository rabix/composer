import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../../auth/auth/auth.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {WorkboxService} from "../../workbox/workbox.service";
const {app, dialog} = window["require"]("electron").remote;

@Component({
    selector: "ct-add-source-modal",
    template: `
        <div class="header">
            <ct-tab-selector [distribute]="'auto'" [(active)]="activeTab">
                <ct-tab-selector-entry tabName="local">Local</ct-tab-selector-entry>
                <ct-tab-selector-entry tabName="platform">Platform</ct-tab-selector-entry>
            </ct-tab-selector>
        </div>
        <div class="body">
            <div class="dialog-centered dialog-content" *ngIf="activeTab === 'local' && localFoldersToAdd.length === 0">
                <p>
                    Add one or more folders from your computer to the workspace
                </p>
                <div>
                    <button class="btn btn-secondary" (click)="selectLocalFolders()">Select a Folder...</button>
                </div>
            </div>

            <div class="dialog-centered dialog-content" *ngIf="activeTab === 'platform' && !isConnected && !connecting">
                
                <p>
                    Connect to the Seven Bridges Platform
                </p>

                <!--<ct-credentials-form #credsForm [removable]="false"></ct-credentials-form>-->
                <p>
                    <!--<button type="button" class="btn btn-primary" (click)="credsForm.applyValues(); connecting = true;">Connect</button>-->
                    <button type="button" class="btn btn-secondary" (click)="openSettingsTab()">Connect</button>
                </p>
            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && connecting ">
                <p>
                    Checking your connection to the platform...
                    <ct-line-loader></ct-line-loader>
                </p>
            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && isConnected && !loadedProjects">
                <p>
                    Fetching your projects...
                    <ct-line-loader></ct-line-loader>
                </p>
            </div>

            <div class="dialog-connection dialog-content"
                 *ngIf="activeTab === 'platform' && isConnected && loadedProjects && nonAddedUserProjects.length">
                <p>
                    Add Projects to the Workspace
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
                    You have added all your projects to the workspace.
                </p>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="onDone()">Done</button>
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
                private preferences: UserPreferencesService,
                private workbox: WorkboxService) {

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

    openSettingsTab() {
       this.workbox.openSettingsTab();
       this.modal.close();
    }
}
