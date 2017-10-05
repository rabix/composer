import {Component, Input, OnInit} from "@angular/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs/Observable";

@Component({
    selector: "login",
    template: `
        <form class="web-login" (ngSubmit)="form.valid && submit()" [formGroup]="form">
            <div class="m-2">
                <div class="row form-group">
                    <label class="col-xs-4 col-form-label">API host:</label>
                    <div class="col-xs-8">
                        <input
                        formControlName="apiHost"
                        class="form-control apiHost-control"
                        placeholder="https://www.example.com/"
                        type="text"/>
                    </div>
                    <div class="col-xs-12">
                        <div *ngIf="form.dirty && form.invalid">
                            <span class="text-danger" *ngIf="form.get('apiHost').hasError('pattern')">
                                <i class="fa fa-times-circle fa-fw"></i>
                                    <span>Invalid host.</span>
                            </span>                        
                        </div>
                    </div>
                </div>
                <button
                class="btn btn-primary btn-block"
                [disabled]="!form.valid || !form.dirty"
                type="submit">Log In</button>
            </div>           
        </form>
    `,
    styleUrls: [
        "./login.component.css"
    ]
})
export class LoginComponent implements OnInit {

    static readonly URL_VALIDATION_REGEXP = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*))/g;

    @Input() apiHost: string;
    form: FormGroup;

    submit(): void {

        const {apiHost} = this.form.getRawValue();
        const returnTo = encodeURIComponent(document.location.href.replace(/\?.*/, ''));

        document.location.href = apiHost + 'login?return_to=' + returnTo;

    }

    ngOnInit() {

        this.form = new FormGroup({
            apiHost: new FormControl(this.apiHost, [
                Validators.required,
                Validators.pattern(LoginComponent.URL_VALIDATION_REGEXP)
            ])
        });

    }

    tokenReturnCallback(): boolean {
        // If there's a token and baseURL in the location bar (i.e.,
        // we just landed here after a successful login), save it and
        // scrub the location bar.
        if (document.location.search[0] != '?') {
            return false;
        }

        var params = {};
        document.location.search.slice(1).split('&').map(function(kv) {
            var e = kv.indexOf('=');
            if (e < 0) {
                return false;
            }

            params[decodeURIComponent(kv.slice(0, e))] = decodeURIComponent(kv.slice(e+1));
        })

        if (params.hasOwnProperty("baseURL") || !params.hasOwnProperty("api_token")) {
            // Have a query string, but it's not a login callback.
            return false;
        }

        localStorage.setItem("apiToken", params["api_token"]);
        history.replaceState({}, '', document.location.origin + document.location.pathname);        
    }  
}