import {ChangeDetectionStrategy, Component} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {SendFeedbackModalComponent} from "../../core/modals/send-feedback-modal/send-feedback.modal.component";
import {SystemService} from "../../platform-providers/system.service";
import {CredentialsEntry} from "../../services/storage/user-preferences-types";
import {ModalService} from "../../ui/modal/modal.service";

@Component({
    styleUrls: ["getting-started.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-getting-started",
    template: `
        <!--Caption-->
        <p class="text-title">Getting Started</p>

        <!--Items-->
        <div class="items">
            <!--Item-->
            <div class="item">
                <p class="subtitle">New to Rabix Composer?</p>
                <p>Rabix Composer is a standalone editor Common Workflow Language tools and workflows.
                    <a data-test="new-to-link" href
                       (click)="openLink('https://github.com/rabix/cottontail-frontend/wiki/Introduction-to-Rabix-and-Rabix-Composer'); false;">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Learn how to build a tool</p>
                <p>Having uploaded a Docker image containing your tool to the image registry, you can specify its
                    behavior, including its inputs and outputs.
                    <a href data-test="learn-how-to-link"
                       (click)="openLink('https://github.com/rabix/cottontail-frontend/wiki/About-the-tool-editor'); false;">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Need help?</p>
                <p>If you have any problem, idea or a thought let us know.</p>
                <p>
                    <button type="button" data-test="get-support-btn" class="btn btn-secondary"
                            (click)="initiateFeedbackDialog()">
                        Get support
                    </button>
                </p>
            </div>
        </div>
    `
})
export class GettingStartedComponent {

    constructor(private modal: ModalService,
                private auth: AuthService,
                private system: SystemService) {
    }

    openLink(link: string) {
        this.system.openLink(link);
    }

    openMailClient(): void {
        this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");
    }

    initiateFeedbackDialog() {

        this.auth.getActive().take(1).toPromise().then((credentials) => {
            if (!credentials) {
                this.openMailClient();
                return;
            }

            const modal = this.modal.fromComponent(SendFeedbackModalComponent, {title: "Send Feedback"});



        });
    }
}
