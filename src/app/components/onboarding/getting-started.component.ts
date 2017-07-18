import {ChangeDetectionStrategy, Component} from "@angular/core";
import {ModalService} from "../../ui/modal/modal.service";
import {SendFeedbackModalComponent} from "../../core/modals/send-feedback-modal/send-feedback.modal.component";
import {SystemService} from "../../platform-providers/system.service";
import {AuthService} from "../../auth/auth/auth.service";
import {CredentialsEntry} from "../../services/storage/user-preferences-types";

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
                <p>Rabix Composer is a standalone editor for Common Workflow Language tools and workflows.
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
                    <button type="button" data-test="get-support-btn" class="btn btn-primary"
                            (click)="openFeedbackModal()">
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

    openFeedbackModal() {

        this.auth.connections.take(1).subscribe(credentials => {
            let feedbackPlatform = credentials.find(c => c.url.indexOf("-vayu") === -1 && c.url.indexOf("staging") === -1);
            if (!feedbackPlatform && credentials.length) {
                feedbackPlatform = credentials[0];
            }

            if (feedbackPlatform as CredentialsEntry) {

                const modal = this.modal.fromComponent(SendFeedbackModalComponent, {
                    title: "Send Feedback",
                    backdrop: true
                });

                modal.feedbackPlatform = feedbackPlatform;

                return;
            }

            return this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");

        });
    }
}
