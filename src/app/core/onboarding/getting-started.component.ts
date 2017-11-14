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
                <p class="subtitle">Before you start building</p>

                <p>
                    Learn how to set up your workspace by
                    <a #localWorkspaceLink
                       href="http://docs.rabix.io/rabix-composer-configuration#add-a-local-workspace"
                       (click)="system.openLink(localWorkspaceLink.href, $event)"
                       data-test="local-workspace-link">
                        adding a local workspace
                    </a>
                    and
                    <a #connectingPlatformLink
                       href="http://docs.rabix.io/rabix-composer-configuration#connect-a-platform-account"
                       (click)="system.openLink(connectingPlatformLink.href, $event)"
                       data-test="connecting-platform-link">
                        connecting your Platform account.
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Build tools and workflows</p>
                <p>
                    <a #toolLink href="http://docs.rabix.io/tutorial-1-wrapping-samtools-sort"
                       data-test="tool-docs-link"
                       (click)="system.openLink(toolLink.href, $event)">
                         Wrap your command line tool
                    </a>
                    using the Common Workflow Language.
                    <a #platformWorkflowLink href="http://docs.rabix.io/tutorial-1-a-platform-workflow"
                       data-test="platform-workflow-link"
                       (click)="system.openLink(platformWorkflowLink.href, $event)">
                         Edit a Platform workflow
                    </a>
                     in Rabix Composer.
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p class="subtitle">Need help?</p>
                <p>If you have problems, ideas, or other comments, let us know.</p>
                <p>
                    <button type="button"
                            data-test="get-support-button"
                            class="btn btn-primary"
                            (click)="initiateFeedbackDialog();">
                        Get in Touch
                    </button>
                </p>
            </div>
        </div>
    `
})
export class GettingStartedComponent {

    constructor(public auth: AuthService,
                public system: SystemService,
                private modal: ModalService) {
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
