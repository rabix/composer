import {Component} from "@angular/core";
import {AddSourceModalComponent} from "../modals/add-source-modal/add-source-modal.component";
import {SystemService} from "../../platform-providers/system.service";
import {ModalService} from "../../ui/modal/modal.service";

@Component({
    styleUrls: ["welcome.component.scss"],
    selector: "ct-welcome-tab",
    template: `
        <ct-action-bar></ct-action-bar>
        <div class="content-container p-3">
            <ct-logo class="logo"></ct-logo>

            <div class="background-logo"></div>

            <div class="content">
                <p class="welcome-text">The Rabix Composer is a standalone integrated development environment for workflow
                    description languages that enables rapid workflow composition, testing, and
                    integration
                    with online services like DockerHub.
                    <br/>
                    Visit
                    <a #infoLink href="http://rabix.io" data-test="info-link"
                       (click)="system.openLink(infoLink.href, $event)">rabix.io</a>
                    for more info.
                </p>

                <h2 class="h5 mt-1">
                    <p>Let's set up your workspace</p>
                </h2>

                <p>
                    <button data-test="open-project-btn" type="button"
                            (click)="onOpenProjectButtonClick()"
                            class="btn btn-primary">
                        Open a Project
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

    onOpenProjectButtonClick() {
        this.modal.fromComponent(AddSourceModalComponent, "Open a Project");
    }
}
