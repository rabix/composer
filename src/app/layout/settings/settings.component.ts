import {Component, OnInit} from "@angular/core";
import {AuthService} from "../../auth/auth/auth.service";
import {SettingsService} from "../../services/settings/settings.service";
import {CredentialsEntry} from "../../services/storage/user-preferences-types";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

type ViewMode = "auth" | "keyBindings" | "cache";

@Component({
    selector: "ct-settings",
    styleUrls: ["./settings.component.scss"],
    template: `

        <ct-line-loader *ngIf="auth.authenticationProgress | async"></ct-line-loader>

        <ct-credentials-form #creds [credentials]="credentials"
                             (onSubmit)="submitCredentials($event)"
                             class="p-2"></ct-credentials-form>

        <div class="pull-right col-sm-2">
            <!--Add Another-->
            <button (click)="creds.addEntry()"
                    class="btn btn-secondary"
                    type="button"> Add an Account
            </button>

            <!--Save-->
            <button (click)="creds.submit()"
                    [disabled]="creds.form.invalid"
                    class="btn btn-primary"
                    type="button"> Apply Changes
            </button>
        </div>
    `
})
export class SettingsComponent extends DirectiveBase implements OnInit {
    viewMode: ViewMode = "auth";

    credentials: CredentialsEntry[];

    constructor(private settings: SettingsService,
                public preferences: UserPreferencesService,
                public auth: AuthService) {

        super();
    }

    ngOnInit() {
        this.preferences.getCredentials().take(1).subscribe(c => {
            this.credentials = c;
        });
    }

    submitCredentials(credentials) {
        this.preferences.getCredentials().take(1).subscribe(creds => {
            let credsChanged = true;
            if (creds.length == credentials.length) {
                credsChanged = false;
                for (let i = 0; i < creds.length; i++) {
                    if (!(creds[i].token === credentials[i].token &&
                        creds[i].url === credentials[i].url)) {
                        credsChanged = true;
                    }
                }
            }
            if (credsChanged) {
                this.preferences.setCredentials(credentials);
            }
        });
    }
}
