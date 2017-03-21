import {Component} from "@angular/core";
import {ModalService} from "../../ui/modal/modal.service";
import {AddSourceModalComponent} from "../../core/modals/add-source-modal/add-source-modal.component";

@Component({
    styleUrls: ["welcome.component.scss"],
    selector: "ct-welcome-tab",
    template: `
        <ct-action-bar></ct-action-bar>
        <div class="content-container p-3">
            <h1 class="h3">Welcome to Rabix Composer</h1>

            <p>The Rabix Composer is a standalone integrated environment for workflow
                description languages
                that enables rapid workflow composition, testing, and integration with online services like
                DockerHub.

            </p>
            <p>
                <a href="#">Learn more</a>
            </p>

            <h2 class="h5 mt-1">
                <p>Let's set up your workspace</p>
            </h2>

            <p>
                <button type="button" (click)="onOpenProjectButtonClick()" class="btn btn-primary">
                    Open a Project
                </button>
            </p>
        </div>

        <ct-getting-started></ct-getting-started>

    `
})
export class WelcomeTabComponent {


    constructor(private modal: ModalService) {

    }

    onOpenProjectButtonClick() {
        this.modal.fromComponent(AddSourceModalComponent, {
            title: "Open a Project",
            backdrop: true
        });
    }
}
