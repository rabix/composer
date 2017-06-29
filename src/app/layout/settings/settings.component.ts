import {Component} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {AuthCredentials} from "../../auth/model/auth-credentials";
import {GlobalService} from "../../core/global/global.service";
import {PlatformCredentialsModalComponent} from "../../core/modals/platform-credentials-modal/platform-credentials-modal.component";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {SettingsService} from "../../services/settings/settings.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

type ViewMode = "auth" | "keyBindings" | "cache";

@Component({
    selector: "ct-settings",
    styleUrls: ["./settings.component.scss"],
    template: `
        <ct-action-bar>

            <ct-tab-selector [distribute]="'auto'" [active]="viewMode" (activeChange)="switchTab($event)">
                <ct-tab-selector-entry tabName="auth">Authentication</ct-tab-selector-entry>
                <!--<ct-tab-selector-entry tabName="keyBindings">Key Bindings</ct-tab-selector-entry>-->
                <!--<ct-tab-selector-entry tabName="cache">Cache</ct-tab-selector-entry>-->
            </ct-tab-selector>

        </ct-action-bar>

        <ct-form-panel class="m-2">
            <div class="tc-header">Authentication</div>
            <div class="tc-body">

                <table class="table table-striped">
                    <thead>
                    <tr>
                        <th>Platform</th>
                        <th colspan="2">User</th>
                    </tr>
                    </thead>
                    <tbody>

                    <tr *ngFor="let entry of (auth.getCredentials() | async)" class="align-middle">
                        <td class="align-middle">{{ entry.url }}</td>
                        <td class="align-middle">
                            {{ entry.user.username }}
                            <span *ngIf="(auth.getActive() | async) === entry" class="tag tag-primary">active</span>
                        </td>
                        <td class="text-xs-right">
                            <button *ngIf="(auth.getActive() | async) === entry; else deactivate;"
                                    (click)="setActiveCredentials(undefined)"
                                    class="btn btn-secondary">Deactivate
                            </button>
                            <ng-template #deactivate>
                                <button class="btn btn-secondary" (click)="setActiveCredentials(entry)">Activate</button>
                            </ng-template>
                            <button class="btn btn-secondary" (click)="editCredentials(entry)">Edit</button>
                            <button class="btn btn-secondary" (click)="auth.removeCredentials(entry)">Remove</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                <div class="text-xs-right">
                    <button class="btn btn-secondary" (click)="openCredentialsForm()">Add a Connection...</button>
                </div>
            </div>
        </ct-form-panel>
    `
})
export class SettingsComponent extends DirectiveBase {

    viewMode: ViewMode = "auth";


    constructor(private settings: SettingsService,
                public modal: ModalService,
                private global: GlobalService,
                private workbox: WorkboxService,
                public auth: AuthService) {

        super();
    }

    openCredentialsForm() {
        const credentialsModal = this.modal.fromComponent(PlatformCredentialsModalComponent, {
            title: "Add Connection"
        });

        credentialsModal.submit = () => {
            const credentials = credentialsModal.getValue();
            this.auth.addCredentials(credentials);
            this.modal.close();
        }

    }

    editCredentials(credentials: AuthCredentials) {
        const editor = this.modal.fromComponent(PlatformCredentialsModalComponent, {title: "Edit Connection"});

        editor.user      = credentials.user;
        editor.token     = credentials.token;
        editor.platform  = credentials.url;
        editor.tokenOnly = true;
    }

    /**
     * Changes the view mode
     * @param tab Name of the tab to switch to
     */
    switchTab(tab: ViewMode): void {
        this.viewMode = tab;
    }

    setActiveCredentials(credentials: AuthCredentials) {

        this.auth.setActiveCredentials(credentials).then(() => {
            if(credentials){
                this.global.reloadPlatformData();
            }
            this.workbox.forceReloadTabs();
        });
    }
}
