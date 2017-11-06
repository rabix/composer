import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {ConfigurationService} from "../app.config";
import {environment} from './../../environments/environment';

@Component({
    encapsulation: ViewEncapsulation.None,
    
    selector: "login",
    template: `
        <div class="web-login">
            <div class="m-2">
                <a class="btn btn-primary btn-block" href="{{apiEndPoint}}">Click here to log in</a>
            </div>
        </div>
    `,
    styleUrls: [
        "./../../assets/sass/main.scss",
        "./login.component.scss"
    ]
})
export class LoginComponent implements OnInit {

    public apiEndPoint;

    ngOnInit(): any {
        const returnTo = encodeURIComponent(document.location.href.replace(/\?.*/, ''));
        try {
            let apiEndPoint = ConfigurationService.configuration['apiEndPoint'];
            apiEndPoint = apiEndPoint.lastIndexOf('/') === apiEndPoint.length ? apiEndPoint.slice(0, -1) : apiEndPoint;
            this.apiEndPoint = apiEndPoint + '/login?return_to=' + returnTo;
        } catch (error) {
            console.log('Something went wrong. Please try in few minutes.');
        }
    }

}