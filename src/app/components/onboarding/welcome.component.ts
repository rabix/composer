import {Component} from "@angular/core";

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
                <a href="" target="_blank" class="btn btn-primary">
                    Open a project
                </a>
            </p>
        </div>

        <ct-getting-started></ct-getting-started>

    `
})
export class WelcomeTabComponent {

}
