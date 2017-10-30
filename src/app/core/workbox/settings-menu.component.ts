import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
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
        <ct-generic-dropdown-menu [ct-menu]="menu" menuAlign="left" [menuState]="openStatus"
                                  [class.update-available]="global.platformIsOutdated">

            <button type="button" class="btn btn-unstyled">
                <span *ngIf="active">{{ userLabel }}</span>
                <i class="fa fa-chevron-down fa-fw settings-icon"> </i>
            </button>

        </ct-generic-dropdown-menu>

        <ng-template #menu class="mr-1">
            <ul class="list-unstyled">
                <li *ngFor="let c of credentials | async" (click)="setActiveUser(c)">
                    <span>
                        {{ c.user.username }} 
                        <i *ngIf="active?.equals(c)" class="active-icon fa fa-check-circle"></i>
                    </span>
                    <span class="text-muted d-block small">{{ getPlatformLabel(c.url) }}</span>
                </li>
                <li (click)="openSettings()"><i class="fa fa-cog fa-fw"></i> Settings</li>
                <li (click)="openDocumentation()"><i class="fa fa-question-circle fa-fw"></i> Documentation</li>
                <li (click)="openFeedback()"><i class="fa fa-bullhorn fa-fw"></i> Send Feedback</li>
                <li (click)="checkForPlatformUpdates()" *ngIf="global.platformIsOutdated" class="outdated-update"
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

    hasWarning = false;

    active: AuthCredentials;

    userLabel: string;

    openStatus = new Subject<boolean>();

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
        this.openStatus.next(false);
    }

    openDocumentation(): void {
        this.system.openLink("http://docs.rabix.io/rabix-composer-home");
    }

    openFeedback(): void {
        if (!this.active) {
            this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");
            return;
        }

        this.modal.fromComponent(SendFeedbackModalComponent, {title: "Send Feedback"});

        this.openStatus.next(false);
    }

    setActiveUser(c): void {

        // If we click on a user that is already active, nothing should be done.
        if (this.active === c) {
            this.openStatus.next(false);
            return;
        }

        this.auth.setActiveCredentials(c).then(() => {
            if (c) {
                this.global.reloadPlatformData();
            }
            this.workbox.forceReloadTabs();
        });

        this.openStatus.next(false);
    }

    checkForPlatformUpdates() {
        this.global.checkForPlatformUpdates(true).catch(console.warn);
        this.openStatus.next(false);
    }

    getPlatformLabel(url: string): string {
        return AuthCredentials.getPlatformLabel(url);
    }
}
