import {Component} from "@angular/core";
import {ModalService} from "../../ui/modal/modal.service";
import {SendFeedbackModal} from "../../core/modals/send-feedback-modal/send-feedback.modal.component";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {SystemService} from "../../platform-providers/system.service";
import {AuthService} from "../../auth/auth/auth.service";
import {PlatformAPIGatewayService} from "../../auth/api/platform-api-gateway.service";
import {CredentialsEntry} from "../../services/storage/user-preferences-types";
import {ErrorBarService} from "../../layout/error-bar/error-bar.service";

@Component({
    styleUrls: ["getting-started.component.scss"],
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
                    <a href="#">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Learn how to build a tool</p>
                <p>Having uploaded a Docker image containing your tool to the image registry, you can specify its
                    behavior, including its inputs and outputs.
                    <a href="#">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Need help?</p>
                <p>If you have any problem, idea or a thought let us know.</p>
                <p>
                    <button type="button" class="btn btn-outline-primary" (click)="openFeedbackModal()">
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
                private errorBar: ErrorBarService,
                private apiGateway: PlatformAPIGatewayService,
                private system: SystemService) {
    }

    openFeedbackModal() {

        this.auth.connections.take(1).subscribe(credentials => {
            let feedbackPlatform = credentials.find(c => c.url.indexOf("-vayu") === -1 && c.url.indexOf("staging") === -1);
            if (!feedbackPlatform && credentials.length) {
                feedbackPlatform = credentials[0];
            }

            if (feedbackPlatform as CredentialsEntry) {

                const modal = this.modal.fromComponent(SendFeedbackModal, {
                    title: "Send Feedback",
                    backdrop: true
                });


                modal.sendFeedback = (feedbackType, message) => {
                    this.apiGateway.forHash(feedbackPlatform.hash)
                        .sendFeedback(feedbackPlatform.user.id, feedbackType, message, feedbackPlatform.url)
                        .subscribe(() => {
                            modal.closeModal();
                        }, err => {
                            console.log("Error", err);
                            if (err.status === 0) {
                                this.errorBar.showError("Could not connect to the platform and send a feedback message");
                            } else {
                                this.errorBar.showError(err);
                            }
                        });
                };

                return;
            }

            return this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Executor Feedback");

        });
    }
}
