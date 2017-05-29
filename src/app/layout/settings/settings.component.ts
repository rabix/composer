import {Component} from "@angular/core";
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
        <ct-action-bar>

            <div class="document-controls pr-1">

                <!--Add Another-->
                <button (click)="creds.addEntry()"
                        class="btn btn-secondary text-inherit"
                        type="button"> Add an Account
                </button>

                <!--Save-->
                <button (click)="creds.submit()"
                        [disabled]="creds.form.invalid"
                        class="btn btn-secondary text-inherit"
                        type="button"> Apply Changes
                </button>

            </div>

        </ct-action-bar>

        <ct-line-loader *ngIf="auth.authenticationProgress | async"></ct-line-loader>

        <ct-credentials-form #creds [credentials]="credentials"
                             (onSubmit)="preferences.setCredentials($event)"
                             class="m-2"></ct-credentials-form>
    `
})
export class SettingsComponent extends DirectiveBase {
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
        })
    }

    /**
     * Changes the view mode
     * @param tab Name of the tab to switch to
     */
    switchTab(tab: ViewMode): void {
        this.viewMode = tab;
    }

}
