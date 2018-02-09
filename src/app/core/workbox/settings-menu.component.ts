import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../../auth/auth.service";
import {AuthCredentials} from "../../auth/model/auth-credentials";
import {SystemService} from "../../platform-providers/system.service";
import {SettingsService} from "../../services/settings/settings.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {GlobalService} from "../global/global.service";
import {SendFeedbackModalComponent} from "../modals/send-feedback-modal/send-feedback.modal.component";
import {WorkboxService} from "./workbox.service";

@Component({

    selector: "ct-settings-menu",
    styleUrls: ["./settings-menu.component.scss"],
    template: `
        <ct-generic-dropdown-menu [ct-menu]="menu" menuAlign="left"
                                  [class.update-available]="global.platformIsOutdated" #settingsDropDown>

            <button type="button" 
                    class="btn btn-unstyled" 
                    data-test="settings-menu-button" 
                    (click)="settingsDropDown.toggleMenu()">
                <span *ngIf="active">{{ userLabel }}</span>
                <i class="fa fa-chevron-down fa-fw settings-icon"> </i>
            </button>

        </ct-generic-dropdown-menu>

        <ng-template #menu class="mr-1">
            <ul class="list-unstyled" (click)="settingsDropDown.hide()">
                <li *ngFor="let c of credentials | async" (click)="setActiveUser(c)">
                    <span>
                        {{ c.user.username }} 
                        <i *ngIf="active?.equals(c)" class="active-icon fa fa-check-circle"></i>
                    </span>
                    <span class="text-muted text-nowrap d-block small">{{ getPlatformLabel(c.url) }}</span>
                </li>
                <li (click)="openSettings()" data-test="settings-button"><i class="fa fa-cog fa-fw"></i> Settings</li>
                <li (click)="openDocumentation()" 
                    data-test="documentation-button" 
                    [attr.data-url]="rabixDocLink">
                    
                    <i class="fa fa-question-circle fa-fw"></i> 
                    Documentation
                </li>
                <li (click)="openFeedback()" data-test="send-feedback-button"><i class="fa fa-bullhorn fa-fw"></i> Send Feedback</li>
                <li (click)="checkForPlatformUpdates()" 
                    *ngIf="global.platformIsOutdated" 
                    class="outdated-update"
                    data-test="updates-available">

                    <i class="fa fa-refresh fa-fw "></i>
                    <span>
                        Update available
                    </span>

                </li>
            </ul>
        </ng-template>
    `
})
export class SettingsMenuComponent extends DirectiveBase {

    private rabixDocLink = "http://docs.rabix.io/rabix-composer-home";

    hasWarning = false;

    active: AuthCredentials;

    userLabel: string;

    credentials: Observable<AuthCredentials[]>;

    constructor(public global: GlobalService,
                private workbox: WorkboxService,
                private settings: SettingsService,
                private modal: ModalService,
                private system: SystemService,
                private auth: AuthService) {
        super();

        settings.validity.subscribeTracked(this, isValid => this.hasWarning = !isValid);

        // Store the stream locally so we don't have a auth.getCredentials function call in the template
        this.credentials = auth.getCredentials();

        auth.getActive().subscribeTracked(this, cred => {
            this.active = cred;
            if (this.active) {
                this.userLabel = `${this.active.user.username} (${AuthCredentials.getPlatformShortName(this.active.url)})`;
            }
        });
    }

    openSettings(): void {
        this.workbox.openSettingsTab();
    }

    openDocumentation(): void {
        this.system.openLink(this.rabixDocLink);
    }

    openFeedback(): void {
        if (!this.active) {
            this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");
            return;
        }

        this.modal.fromComponent(SendFeedbackModalComponent, {title: "Send Feedback"});
    }

    setActiveUser(c): void {

        // If we click on a user that is already active, nothing should be done.
        if (this.active === c) {
            return;
        }

        this.auth.setActiveCredentials(c).then(() => {
            if (c) {
                this.global.reloadPlatformData();
            }
            this.workbox.forceReloadTabs();
        });
    }

    checkForPlatformUpdates() {
        this.global.checkForPlatformUpdates(true).catch(console.warn);
    }

    getPlatformLabel(url: string): string {
        return AuthCredentials.getPlatformLabel(url);
    }
}
