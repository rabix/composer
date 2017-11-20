import {Component, Input, OnInit} from "@angular/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {User} from "../../../../../electron/src/sbg-api-client/interfaces/user";
import {AuthService} from "../../../auth/auth.service";
import {AuthCredentials} from "../../../auth/model/auth-credentials";
import {SystemService} from "../../../platform-providers/system.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {GlobalService} from "../../global/global.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {GetStartedNotificationComponent} from "../../../layout/notification-bar/dynamic-notifications/get-started-notification/get-started-notification.component";

@Component({
    selector: "ct-platform-credentials-modal",
    template: `

        <form class="auth-form" data-test="credentials-modal-form" (ngSubmit)="form.valid && submit()" [formGroup]="form">
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
                                          data-test="credentials-modal-platform-field"></ct-auto-complete>
                    </div>
                </div>

                <div class="row form-group" [class.has-warning]="form.get('token').invalid">
                    <label class="col-xs-4 col-form-label">Developer Token:</label>
                    <div class="col-xs-8  form-inline token-form">
                        <input data-test="credentials-modal-token-field"
                               formControlName="token"
                               class="form-control token-control"
                               type="password"/>

                        <button class="ml-1 btn btn-secondary" 
                                type="button"
                                data-test="credentials-modal-get-token-button"
                                [disabled]="form.get('url').invalid"
                                (click)="openTokenPage()">Get Token
                        </button>
                    </div>

                </div>

                <div *ngIf="form.dirty && form.invalid">                    
                    <span class="text-warning" *ngIf="form.get('token').hasError('required')">
                        <i class="fa fa-warning fa-fw"></i>    
                        Token cannot be empty
                    </span>

                    <span class="text-danger" *ngIf="form.get('url').hasError('name')">
                        <i class="fa fa-times-circle fa-fw"></i>
                            <span>Given platform does not exist.</span>
                    </span>

                    <span class="text-danger" *ngIf="form.get('token').hasError('pattern')">
                        <i class="fa fa-times-circle fa-fw"></i>
                            <span>Invalid token</span>
                    </span>

                    <span class="text-danger" *ngIf="form.hasError('tokenCheck')">
                        <i class="fa fa-times-circle fa-fw"></i>
                            <span>Token is not valid for the selected platform. ({{ form.getError("tokenCheck") }})</span>
                    </span>

                </div>

            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" (click)="close()" data-test="credentials-modal-cancel-button">Cancel</button>
                <button class="btn btn-primary" 
                        type="submit"
                        data-test="credentials-modal-apply-button"
                        [class.btn-loader]="form.pending" 
                        [disabled]="!form.valid || !form.dirty">
                    <ng-container *ngIf="!form.pending">Apply</ng-container>
                    <ct-circular-loader class="loader-25" *ngIf="form.pending"></ct-circular-loader>
                </button>
            </div>
        </form>
    `,
    styleUrls: ["./platform-credentials-modal.component.scss"],
})
export class PlatformCredentialsModalComponent implements OnInit {

    /** Allow only token update. If this is true, platform will be disabled and username of the new token must match the old one. */
    @Input() tokenOnly = false;

    /** Public API url */
    @Input() platform = "https://api.sbgenomics.com";

    /** Combined with the “tokenOnly” parameter, checks whether the modified token for a given platform belongs to this user. */
    @Input() user: User;

    /** Modal can be given preset with a token */
    @Input() token: string;

    /** FormGroup for modal inputs */
    form: FormGroup;

    platformList = [
        {text: "Seven Bridges (Default)", value: "https://api.sbgenomics.com"},
        {text: "Seven Bridges (EU)", value: "https://eu-api.sbgenomics.com"},
        {text: "Cancer Genomics Cloud", value: "https://cgc-api.sbgenomics.com"},
        {text: "Cavatica", value: "https://pgc-api.sbgenomics.com"},
    ];

    constructor(private system: SystemService,
                private auth: AuthService,
                private global: GlobalService,
                private data: DataGatewayService,
                private notificationBarService: NotificationBarService,
                private modal: ModalService) {
    }

    submit(): void {

        const {url, token, user} = this.form.getRawValue();
        const credentials        = new AuthCredentials(url, token, user);

        const activeCredentials = this.auth.getActive();
        const allCredentials    = this.auth.getCredentials();
        const credentialsUpdate = Observable.fromPromise(this.auth.addCredentials(credentials));

        credentialsUpdate
            .withLatestFrom(activeCredentials, allCredentials, (_, active, all) => [active, all])
            .take(1)
            .subscribe((results: [AuthCredentials | undefined, AuthCredentials[]]) => {

                const [active, all] = results;

                // Determine whether we are adding new creds or updating old ones
                const isEditing = this.tokenOnly;

                const editedCredentials = new AuthCredentials(url, token, user);

                let maybeUserUpdate = Promise.resolve();

                if (isEditing) {
                    if (editedCredentials.equals(active)) {
                        // If we are editing credentials that appear to be active, update it
                        maybeUserUpdate = this.auth.setActiveCredentials(editedCredentials);
                    }

                } else {
                    // Activate added credentials
                    maybeUserUpdate = this.auth.setActiveCredentials(credentials);
                    const component = this.notificationBarService.showDynamicNotification(GetStartedNotificationComponent, {
                        type: "info"
                    });

                    component.environment = AuthCredentials.getPlatformLabel(url);
                    component.username = user.username;

                    component.dismiss.take(1).subscribe(() => {
                        this.notificationBarService.dismissDynamicNotification(component);
                    });
                }

                maybeUserUpdate.then(() => this.global.reloadPlatformData());

                this.modal.close();

            });

    }

    getValue(): AuthCredentials {
        const {url, token, user} = this.form.getRawValue();
        return new AuthCredentials(url, token, user);
    }

    /**
     * Prepare a form for editing an existing {@link AuthCredentials} object.
     * This will populate form fields with credentials properties and lock everything except token editing.
     *
     * @param {AuthCredentials} credentials
     */
    prepareEdit(credentials: AuthCredentials): void {
        this.user      = credentials.user;
        this.token     = credentials.token;
        this.platform  = credentials.url;
        this.tokenOnly = true;
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

    close() {
        this.modal.close();
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
}

