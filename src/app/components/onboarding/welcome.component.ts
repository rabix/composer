import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {PlatformSettings, SettingsService} from "../../services/settings/settings.service";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {Subscription} from "rxjs";
import {SystemService} from "../../platform-providers/system.service";

@Component({
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["welcome.component.scss"],
    selector: "ct-welcome-tab",
    template: `
        
    <div class="content-container">
        <div class="content">
            <h3>
                <p>Welcome to Rabix composer</p>
            </h3>
    
            <p class="text-left">The rabix Composer is a standalone integrated environment for workflow
                description languages
                that enables rapid workflow composition, testing, and integration with online services like
                DockerHub.
                <a href="" target="_blank">
                    Learn more
                </a>
            </p>
    
            <h5>
                <p>Let's set up your workspace</p>
            </h5>
    
            <p>
                <a href="" target="_blank"
                   class="btn btn-primary">
                    Open a project
                </a>
            </p>
        </div>
    </div>    
    
    <ct-footer-tab>
        
    </ct-footer-tab> 
        
    `
})
export class WelcomeTabComponent {

}
