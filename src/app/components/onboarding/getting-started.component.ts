import {Component} from "@angular/core";

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
                    <a href="#" class="btn btn-outline-primary">
                        Get support
                    </a>
                </p>
            </div>
        </div>
    `
})
export class GettingStartedComponent {

}
