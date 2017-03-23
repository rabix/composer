import {Component} from "@angular/core";
import {ModalService} from "../../ui/modal/modal.service";
import {SendFeedbackModal} from "../../core/modals/send-feedback-modal/send-feedback.modal.component";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {SystemService} from "../../platform-providers/system.service";

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
                    <a href="#" class="btn btn-outline-primary" (click)="openFeedbackModal()">
                        Get support
                    </a>
                </p>
            </div>
        </div>
    `
})
export class GettingStartedComponent {


    constructor(private modal: ModalService, private platformApi: PlatformAPI, private system: SystemService) {
    }

    openFeedbackModal() {

        this.platformApi.sessionID.take(1).subscribe((sessionId) => {
            if (sessionId) {

                // User has an account and is connected to the platform

                const modal = this.modal.fromComponent(SendFeedbackModal, {
                    title: "Send feedback",
                    backdrop: true
                });

                modal.sendFeedback = (feedbackType, message) => {
                    this.platformApi.sendFeedback(feedbackType, message).subscribe(() => {
                        modal.closeModal();
                    });
                };

            } else {

                // User is not connected to the platform

                this.system.openLink("mailto:support@sbgenomics.com?subject=Cottontail Feedback");
            }
        });
    }
}
