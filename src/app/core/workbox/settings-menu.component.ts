import {Component} from "@angular/core";
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
        <ct-generic-dropdown-menu [ct-menu]="menu" menuAlign="left" [menuState]="openStatus">
            <span *ngIf="active">{{ userLabel }}</span>
            <i class="fa fa-sliders fa-fw settings-icon" *ngIf="!active"> </i>
        </ct-generic-dropdown-menu>

        <ng-template #menu class="mr-1">
            <ul class="list-unstyled">
                <li *ngFor="let c of auth.getCredentials() | async"
                    (click)="setActiveUser(c)">
                    <span>
                        {{ c.user.username }} 
                        <i class="active-icon fa fa-check-circle"
                           *ngIf="active === c"></i>
                    </span>
                    <span class="text-muted d-block small">{{ c.url }}</span>
                </li>
                <li (click)="openSettings()"><i class="fa fa-sliders fa-fw"></i> Settings</li>
                <li (click)="openFeedback()"><i class="fa fa-bullhorn fa-fw"></i> Send Feedback</li>
            </ul>
        </ng-template>
    `
})
export class SettingsMenuComponent extends DirectiveBase {

    public hasWarning = false;

    active: AuthCredentials;

    userLabel: string;

    openStatus = new Subject<boolean>();

    constructor(private workbox: WorkboxService,
                private settings: SettingsService,
                private modal: ModalService,
                private system: SystemService,
                private global: GlobalService,
                public auth: AuthService) {
        super();
        settings.validity.subscribeTracked(this, isValid => this.hasWarning = !isValid);

        auth.getActive().subscribeTracked(this, cred => {
            this.active = cred;
            if (this.active) {
                this.userLabel = `${this.active.user.username} (${AuthCredentials.getPlatformShortName(this.active.url)})`;
            }
        });
    }

    openSettings() {
        this.workbox.openSettingsTab();
        this.openStatus.next(false);
    }

    openFeedback() {
        if (!this.active) {
            this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");
            return;
        }

        this.modal.fromComponent(SendFeedbackModalComponent, {title: "Send Feedback"});

        this.openStatus.next(false);
    }

    setActiveUser(c) {
        this.auth.setActiveCredentials(c).then((user) => {
            if (c) {
                this.global.reloadPlatformData();
            }
            this.workbox.forceReloadTabs();
        });

        this.openStatus.next(false);
    }
}
