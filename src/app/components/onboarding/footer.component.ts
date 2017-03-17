import {Component, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["footer.component.scss"],
    selector: "ct-footer-tab",
    template: `                
        <!--Caption-->
        <div class="caption">
            <h5>
                <p><b>GETTING STARTED</b></p>
            </h5>
        </div>

        <!--Items-->
        <div class="items">

            <!--Item-->
            <div class="item">
                <p><b>New to Rabix composer?</b></p>
                <p>The Rabix Composer is a standalone integrated development environment for worklow description
                    languages.
                    <a href="" target="_blank">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p><b>Learn how to build a tool</b></p>
                <p>Having uploaded a Docker image containing your tool to the image registry, you can specify its
                    behavior, including its inputs and outputs...
                    <a href="" target="_blank">
                        Learn more
                    </a>
                </p>
            </div>

            <!--Item-->
            <div class="item">
                <p><b>Need help?</b></p>
                <p>If you have any problem, idea or a thought let us know.</p>
                <p>
                    <a href="" target="_blank"
                       class="btn btn-primary">
                        Get support
                    </a>
                </p>
            </div>
        </div>

    `
})
export class FooterTabComponent {

}
