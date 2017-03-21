import {Component, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {SettingsService} from "../../../services/settings/settings.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";

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
            <div class="dialog-local" *ngIf="activeTab === 'local'">
                <p>
                    <strong>Add a folder from your computer to the workspace</strong>
                </p>
                <div>
                    <button class="btn btn-secondary">Select a Folder...</button>
                </div>
            </div>

            <div class="dialog-connection" *ngIf="activeTab === 'platform' && projectStep === 'connect'">
                <p>
                    <strong>Connect to the Seven Bridges Platform</strong>
                </p>
                <ct-platform-connection-form (submission)="onConnectionSubmission($event)"></ct-platform-connection-form>
            </div>


            <div class="dialog-connection" *ngIf="activeTab === 'platform' && projectStep === 'add'">
                <p>
                    <strong>Add Projects to the Workspace</strong>
                </p>
                <div>
                    <!--<ct-select [create]="false" [items]="nonAddedUserProjects"></ct-select>-->
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


            <div class="footer pr-1 pb-1">
                <button type="button" class="btn btn-secondary">Cancel</button>
                <button type="button" class="btn btn-success">Done</button>
            </div>
        </div>
    `,
    styleUrls: ["./add-source-modal.component.scss"],
})
export class AddSourceModalComponent extends DirectiveBase implements OnInit {

    activeTab = "local";

    projectStep: "connect" | "add" | "checking-connection" | "checking-apps" = "checking-connection";

    nonAddedUserProjects = [];

    constructor(settings: SettingsService,
                data: DataGatewayService,
                preferences: UserPreferencesService) {

        super();

        const validity = settings.validity;
        this.tracked   = validity.take(1).subscribe(isValid => {
            console.log("Settings validity", isValid);
            this.projectStep = isValid ? "checking-apps" : "connect";
        });

        this.tracked = data.scanCompletion
            .flatMap(_ => settings.platformConfiguration)
            .flatMap(config => {
                const profile = SettingsService.urlToProfile(config.url);
                console.log("Cache key", profile, config);
                return preferences.get(`dataCache.${profile}`, {projects: []})
            })
            .do(_ => {
                console.log("From cache", _);
            })
            .map(cache => cache.projects)
            .subscribe(projects => {
                console.log("Received projects", projects);
                this.projectStep = "add";
            });


    }

    ngOnInit() {

    }

    onConnectionSubmission(val) {

        this.projectStep = "add";
        console.log("On connection submission", val);
    }

}
