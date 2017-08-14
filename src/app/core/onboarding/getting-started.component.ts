import {ChangeDetectionStrategy, Component} from "@angular/core";
import {AuthService} from "../../auth/auth.service";
import {SystemService} from "../../platform-providers/system.service";
import {ModalService} from "../../ui/modal/modal.service";
import {SendFeedbackModalComponent} from "../modals/send-feedback-modal/send-feedback.modal.component";

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
                    <a #introLink data-test="new-to-link"
                       href="https://github.com/rabix/cottontail-frontend/wiki/Introduction-to-Rabix-and-Rabix-Composer"
                       (click)="system.openLink(introLink.href, $event);">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Learn how to build a tool</p>
                <p>Having uploaded a Docker image containing your tool to the image registry, you can specify its
                    behavior, including its inputs and outputs.
                    <a #docsLink href="https://github.com/rabix/composer/wiki/The-tool-editor" data-test="tool-docs-link"
                       (click)="system.openLink(docsLink.href, $event)">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Need help?</p>
                <p>If you have any problem, idea or a thought let us know.</p>
                <p>
                    <button type="button"
                            data-test="get-support-btn"
                            class="btn btn-primary"
                            (click)="initiateFeedbackDialog();">
                        Get Support
                    </button>
                </p>
            </div>
        </div>
    `
})
export class GettingStartedComponent {

    constructor(public auth: AuthService,
                public system: SystemService,
                private modal: ModalService,) {
    }

    initiateFeedbackDialog() {

        this.auth.getActive().take(1).subscribe(credentials => {
            if (credentials) {
                this.modal.fromComponent(SendFeedbackModalComponent, "Send Feedback");
                return;
            }
            this.system.openLink("mailto:support@sbgenomics.com?subject=Rabix Composer Feedback");
        });
    }
}
