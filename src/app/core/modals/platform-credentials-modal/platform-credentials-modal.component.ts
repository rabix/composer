import {Component, Input, OnInit} from "@angular/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../../../../electron/src/sbg-api-client/interfaces/user";
import {AuthCredentials} from "../../../auth/model/auth-credentials";
import {SystemService} from "../../../platform-providers/system.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import "rxjs/add/operator/toPromise";

@Component({
    selector: "ct-platform-credentials-modal",
    template: `

        <form class="auth-form" data-test="form" (ngSubmit)="form.valid && submit()" [formGroup]="form">
            <div class="m-2">
                <input type="hidden" formControlName="user"/>

                <div class="row form-group" [class.has-warning]="form.get('url').invalid">
                    <label class="col-xs-4 col-form-label">Platform:</label>
                    <div class="col-xs-8">
                        <ct-auto-complete [mono]="true"
                                          [create]="false"
                                          [sortField]="false"
                                          formControlName="url"
                                          [options]="platformList"
                                          [readonly]="tokenOnly"
                                          data-test="platform-field"></ct-auto-complete>
                    </div>
                </div>

                <div class="row form-group" [class.has-warning]="form.get('token').invalid">
                    <label class="col-xs-4 col-form-label">Developer Token:</label>
                    <div class="col-xs-8  form-inline token-form">
                        <input data-test="token-field"
                               [formControl]="form.get('token')"
                               class="form-control token-control"
                               type="password"/>

                        <button class="ml-1 btn btn-secondary" type="button"
                                [disabled]="form.get('url').invalid"
                                (click)="openTokenPage()">Get Token
                        </button>
                    </div>

                </div>

                <div class="alert alert-warning pl-2" *ngIf="form.dirty && form.invalid">
                    <span *ngIf="form.hasError('tokenCheck')">
                        Token is not valid for the selected platform. ({{ form.getError("tokenCheck") }})
                    </span>
                    <span *ngIf="form.get('url').hasError('name')">Given platform does not exist.</span>
                    <span *ngIf="form.get('token').errors">Invalid Token</span>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" (click)="close()">Cancel</button>
                <button class="btn btn-primary" type="submit" [class.btn-loader]="form.pending" [disabled]="!form.valid">
                    <ng-container *ngIf="!form.pending">Apply</ng-container>
                    <ct-circular-loader class="loader-25" *ngIf="form.pending"></ct-circular-loader>
                </button>
            </div>
        </form>
    `,
    styleUrls: ["./platform-credentials-modal.component.scss"],
})
export class PlatformCredentialsModalComponent implements OnInit {

    /**
     * Allow only token update. If this is true, platform will be disabled and username of the new token must match the old one.
     */
    @Input() tokenOnly = false;

    @Input() token: string;

    @Input() platform = "https://api.sbgenomics.com";

    /**
     * Combined with the “tokenOnly” parameter, checks whether the modified token for a given platform belongs to this user.
     */
    @Input() user: User;


    form: FormGroup;

    platformList = [
        {text: "Seven Bridges (Default)", value: "https://api.sbgenomics.com"},
        {text: "Seven Bridges (Google Cloud Platform)", value: "https://gcp-api.sbgenomics.com"},
        {text: "Seven Bridges (EU)", value: "https://eu-api.sbgenomics.com"},
        {text: "Cancer Genomics Cloud", value: "https://cgc-api.sbgenomics.com"},
        {text: "Cavatica", value: "https://pgc-api.sbgenomics.com"},
        {text: "Blood Profiling Atlas", value: "https://bpa-api.sbgenomics.com"},
    ];

    constructor(private system: SystemService,
                private data: DataGatewayService,
                private modal: ModalService) {
    }

    submit(): void {
        // Should be overridden from the modal creator
    }

    getValue(): AuthCredentials {
        const {url, token, user} = this.form.getRawValue();
        return new AuthCredentials(url, token, user);
    }

    private debounce(fn: (control: AbstractControl) => Promise<any>, time = 300): (control: AbstractControl) => Promise<any> {
        let timeout;

        return (control: AbstractControl) => {
            return new Promise((resolve, reject) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fn(control).then(resolve, reject);
                }, time);

            });

        };
    }

    ngOnInit() {

        this.form = new FormGroup({

                url: new FormControl(this.platform, [
                    Validators.required,
                    (ctrl: AbstractControl) => {
                        const val = ctrl.value || "";
                        if (this.platformList.map(e => e.value).indexOf(val) === -1) {
                            return {name: true};
                        }

                        return null;
                    }
                ]),
                token: new FormControl(this.token, [
                    Validators.required,
                    Validators.pattern(AuthCredentials.TOKEN_VALIDATION_REGEXP)
                ]),
                user: new FormControl(this.user)
            },
            // No sync validators on the form level
            null,

            /**
             * Create an async validator which checks if we can fetch a user from the selected platform with a given token
             */
            this.debounce((form: FormGroup) => {

                form.get("user").setValue(undefined, {emitEvent: false, onlySelf: true});

                const {url, token} = form.getRawValue();

                return this.data.getUserWithToken(url, token).take(1).toPromise().then(user => {
                    form.get("user").setValue(user, {emitEvent: false, onlySelf: true});

                    if (this.tokenOnly && user.username !== this.user.username) {
                        return {tokenCheck: "Token belongs to a different user."};
                    }

                    return null;
                }, rejection => {
                    console.log("Token rejection", rejection);
                    return {tokenCheck: rejection.message};
                });

            })
        );
    }

    openTokenPage() {
        const apiURL: string = this.form.get("url").value;
        const apiSubdomain   = apiURL.slice("https://".length, apiURL.length - ".sbgenomics.com".length);

        let platformSubdomain = "igor";
        if (apiSubdomain.endsWith("-api")) {
            platformSubdomain = apiSubdomain.slice(0, apiSubdomain.length - ".com".length);
        }
        const url = `https://${platformSubdomain}.sbgenomics.com/developer#token`;
        this.system.openLink(url);
    }

    close(){
        this.modal.close();
    }
}

