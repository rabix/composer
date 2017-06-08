import {Component} from "@angular/core";
import {ModalService} from "../../ui/modal/modal.service";
import {AddSourceModalComponent} from "../../core/modals/add-source-modal/add-source-modal.component";
import {SystemService} from "../../platform-providers/system.service";

@Component({
    styleUrls: ["welcome.component.scss"],
    selector: "ct-welcome-tab",
    template: `
        <ct-action-bar></ct-action-bar>
        <div class="content-container p-3">
            <h1 class="h3">
                <ct-logo></ct-logo>
            </h1>

            <div class="background-logo">
            </div>
            
            <div class="content">
                <p class="welcome-text">The Rabix Composer is a standalone integrated development environment for workflow
                    description languages that enables rapid workflow composition, testing, and
                    integration
                    with online services like DockerHub.
                    <br/>
                    Visit <a href data-test="info-link"
                             (click)="openLink('http://rabix.io/'); false;">
                        rabix.io</a> for more info.
                </p>

                <h2 class="h5 mt-1">
                    <p>Let's set up your workspace</p>
                </h2>

                <p>
                    <button data-test="open-project-btn" type="button" (click)="onOpenProjectButtonClick()"
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


    constructor(private modal: ModalService, private system: SystemService) {

    }

    openLink(link: string) {
        this.system.openLink(link);
    }

    onOpenProjectButtonClick() {
        this.modal.fromComponent(AddSourceModalComponent, {
            title: "Open a Project",
            backdrop: true
        });
    }
}
