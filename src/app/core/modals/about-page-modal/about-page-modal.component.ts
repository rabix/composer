import {Component} from "@angular/core";
import {SystemService} from "../../../platform-providers/system.service";

@Component({
    selector: "ct-about-page-modal-component",
    styleUrls: ["about-page.modal.component.scss"],
    template: `
        <div class="body">

            <!--Header-->
            <div class="header">

                <div class="logo-img mb-1">
                </div>

                <div class="header-text">
                    Rabix Composer ({{version}})
                </div>
            </div>

            <!--Content-->
            <div class="content">
                <hr>
                <div class="description">
                    <p>
                        An open-source integrated development environment for the
                        
                        <a #cwlLink href="http://www.commonwl.org"
                           (click)="system.openLink(cwlLink.href); false;">
                            Common Workflow Language
                        </a>
                        
                    </p>

                    <p>
                        Developed by
                        <a #sbgLink href="https://www.sevenbridges.com"
                           (click)="system.openLink(sbgLink.href); false;">
                            Seven Bridges
                        </a>
                    </p>

                    <p>
                        Follow us on
                        <a #twitterLink href="https://twitter.com/SBGenomics"
                           (click)="system.openLink(twitterLink.href); false;">
                            Twitter
                        </a>
                    </p>

                    <p>
                        Source code available on
                        <a #gitHubLink href="https://github.com/rabix/composer"
                           (click)="system.openLink(gitHubLink.href); false;">
                            GitHub
                        </a>
                    </p>

                    <p>
                        Licensed under the Apache License, Version 2.0 (the "License");
                        you may not use this file except in compliance with the License.
                        You may obtain a copy of the License at
                    </p>

                    <p>
                        <a #apacheLink href="http://www.apache.org/licenses/LICENSE-2.0"
                           (click)="system.openLink(apacheLink.href); false;">
                            http://www.apache.org/licenses/LICENSE-2.0
                        </a>
                    </p>

                    <p>
                        Unless required by applicable law or agreed to in writing, software
                        distributed under the License is distributed on an "AS IS" BASIS,
                        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                        See the License for the specific language governing permissions and
                        limitations under the License.
                    </p>

                    <p class="text-xs-center">
                        Acknowledgement
                    </p>

                    <p>
                        Rabix Composer utilizes other open source software, the use of which is hereby acknowledged in
                        the
                        <a #noticeLink href="https://github.com/rabix/composer/blob/master/NOTICE.md"
                           (click)="system.openLink(noticeLink.href); false;">
                            Notice
                        </a>
                        file in the Composer GitHub repo.
                    </p>

                </div>

                <hr>

                <span class="text-muted">
                    Copyright 2017 Seven Bridges
                </span>
            </div>

        </div>
    `
})
export class AboutPageModalComponent {

    version = window["require"]("electron").remote.app.getVersion();

    constructor(public system: SystemService) {
    }
}
