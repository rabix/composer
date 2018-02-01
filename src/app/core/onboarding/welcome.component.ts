import {Component} from "@angular/core";
import {SystemService} from "../../platform-providers/system.service";
import {ModalService} from "../../ui/modal/modal.service";
import {PlatformCredentialsModalComponent} from "../modals/platform-credentials-modal/platform-credentials-modal.component";

@Component({
    styleUrls: ["welcome.component.scss"],
    selector: "ct-welcome-tab",
    template: `
        <ct-action-bar></ct-action-bar>
        <div class="content-container p-3">
            <ct-logo class="logo"></ct-logo>

            <div class="background-logo"></div>

            <div class="content">
                <p class="welcome-text">
                    The Rabix Composer is a local development environment for workflow description languages
                    which enables rapid workflow composition, testing, and integration
                    with online services like DockerHub.
                    <br/>
                    Visit
                    <a #infoLink href="http://rabix.io" data-test="info-link"
                       (click)="system.openLink(infoLink.href, $event)">rabix.io</a>
                    for more information.
                </p>

                <h2 class="h5 mt-1">
                    <p>Let's set up your workspace</p>
                </h2>

                <p>
                    <button data-test="connect-to-platform-btn" type="button"
                            (click)="onConnectButtonClick()"
                            class="btn btn-primary">
                        Connect to the Platform
                    </button>
                </p>
            </div>
        </div>

        <ct-getting-started></ct-getting-started>

    `
})
export class WelcomeTabComponent {

    constructor(public system: SystemService,
                private modal: ModalService) {
    }

    onConnectButtonClick() {
        const modal = this.modal.fromComponent(PlatformCredentialsModalComponent, "Add an Account");

        modal.submit.take(1).subscribe(() => {
            modal.close();
        });
    }
}
