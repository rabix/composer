import {Component} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {AuthCredentials} from "../../auth/model/auth-credentials";
import {GlobalService} from "../../core/global/global.service";
import {PlatformCredentialsModalComponent} from "../../core/modals/platform-credentials-modal/platform-credentials-modal.component";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-settings",
    styleUrls: ["./settings.component.scss"],
    template: `

        <ct-action-bar></ct-action-bar>

        <ct-form-panel class="m-2">
            <div class="tc-header">Authentication</div>

            <div class="tc-body">
                <div *ngIf="(auth.getCredentials() | async).length; else blankState">
                    <table class="table table-striped">
                        <thead>
                        <tr>
                            <th>Platform</th>
                            <th colspan="2">User</th>
                        </tr>
                        </thead>
                        <tbody>

                        <tr *ngFor="let entry of (auth.getCredentials() | async)"
                            class="align-middle">

                            <td class="align-middle">{{ getPlatformLabel(entry.url) }}</td>

                            <td class="align-middle">
                                {{ entry.user.username }}
                                <span *ngIf="(auth.getActive() | async) === entry"
                                      class="tag tag-primary"
                                      data-test="activa-user-tag">active</span>
                            </td>

                            <td class="text-xs-right">
                                <button *ngIf="(auth.getActive() | async) === entry; else deactivate;"
                                        class="btn btn-secondary"
                                        data-test="authentication-deactivate-button"
                                        (click)="setActiveCredentials(undefined)">Deactivate
                                </button>
                                <ng-template #deactivate>
                                    <button class="btn btn-secondary"
                                            data-test="authentication-activate-button"
                                            (click)="setActiveCredentials(entry)">Activate
                                    </button>
                                </ng-template>
                                <button class="btn btn-secondary"
                                        data-test="authentication-edit-button"
                                        (click)="editCredentials(entry)">Edit
                                </button>
                                <button class="btn btn-secondary"
                                        data-test="authentication-remove-button"
                                        (click)="auth.removeCredentials(entry)">Remove
                                </button>
                            </td>

                        </tr>
                        </tbody>
                    </table>

                    <div class="text-xs-right">
                        <button class="btn btn-primary" (click)="openCredentialsForm()">Add a
                            Connection
                        </button>
                    </div>
                </div>
            </div>

            <ng-template #blankState>
                <ct-blank-state data-test="settings-blank-state-add-button"
                                [buttonText]="'Add a Connection'"
                                [learnMoreURL]="'http://docs.rabix.io/rabix-composer-configuration#connect-a-platform-account'"
                                [description]="'Create a connection to one of the Seven Bridges platforms to be able to create, edit and sync platform apps.'"
                                (buttonClick)="openCredentialsForm()">
                </ct-blank-state>
            </ng-template>
        </ct-form-panel>

        <ct-form-panel class="m-2">
            <div class="tc-header">Rabix Executor</div>
            <div class="tc-body p-1">
                <ct-executor-config></ct-executor-config>
            </div>
        </ct-form-panel>
    `
})
export class SettingsComponent extends DirectiveBase {

    viewMode: "bunnyConfig" | "auth" = "auth";

    constructor(public auth: AuthService,
                public modal: ModalService,
                private global: GlobalService,
                private workbox: WorkboxService) {

        super();
    }

    openCredentialsForm() {
        this.modal.fromComponent(PlatformCredentialsModalComponent, "Add Connection");
    }

    editCredentials(edited: AuthCredentials) {
        const modal = this.modal.fromComponent(PlatformCredentialsModalComponent, "Edit Connection");

        modal.prepareEdit(edited);
    }

    setActiveCredentials(credentials?: AuthCredentials) {

        this.auth.setActiveCredentials(credentials).then(() => {
            if (credentials) {
                this.global.reloadPlatformData();
            }
            this.workbox.forceReloadTabs();
        });
    }

    getPlatformLabel(url: string): string {
        return AuthCredentials.getPlatformLabel(url);
    }
}
