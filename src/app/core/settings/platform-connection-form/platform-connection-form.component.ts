import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AbstractControl, FormControl, FormGroup, Validators} from "@angular/forms";
import {SystemService} from "../../../platform-providers/system.service";
import {PlatformAPI} from "../../../services/api/platforms/platform-api.service";
import {SettingsService} from "../../../services/settings/settings.service";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-platform-connection-form",
    template: `
        <form (ngSubmit)="onSubmit()"
              [formGroup]="formGroup"
              [class.has-success]="formGroup.valid"
              [class.has-warning]="formGroup.errors">

            <!--Platform URL Input field-->
            <div class="form-group" [class.has-danger]="formGroup.controls.url.invalid">

                <label class="strong" for="sbgApiKey">Seven Bridges Platform URL</label>
                <input class="form-control form-control-success form-control-danger form-control-warning"
                       formControlName="url"
                       (blur)="expandPlatformUrl(formGroup.controls.url)"
                       id="sbgPlatform"
                       placeholder="https://igor.sbgenomics.com"/>

                <div class="form-control-feedback" *ngIf="formGroup.controls.url?.dirty && formGroup.controls.url?.errors?.pattern">
                    Invalid Platform Name. Try with something like <i>“https://igor.sbgenomics.com”</i>.
                </div>
            </div>

            <!--Platform Key Input Field-->
            <div class="form-group"
                 [class.has-danger]="formGroup.controls.token.invalid">

                <label class="strong" for="sbgApiKey">Authentication Key</label>
                <input class="form-control form-control-success form-control-danger form-control-warning"
                       formControlName="token"
                       id="sbgApiKey"/>

                <div class="form-control-feedback" *ngIf="formGroup.controls.token?.dirty && formGroup.controls.token?.errors?.length">
                    The Authentication Key must be 32 characters long.
                </div>

                <small class="form-text text-muted">
                    You can generate and see the key on the

                    <a href="" (click)="$event.preventDefault(); openTokenPage()">
                        Seven Bridges Platform
                    </a>
                </small>
            </div>

            <div *ngIf="form?.errors?.invalidKey" class="alert alert-warning">
                <strong>Warning!</strong> This authentication key is not valid on the given platformGroup.
            </div>
            <div *ngIf="form?.errors?.invalidPlatform" class="alert alert-danger">
                <strong>Danger!</strong> Given platform does not exist.
            </div>

            <button type="submit" class="btn btn-success"
                    [disabled]="checkInProgress || formGroup.invalid">
                <span *ngIf="checkInProgress">Checking...</span>
                <span *ngIf="!checkInProgress">Connect</span>
            </button>
        </form>
    `,
    styleUrls: ["./platform-connection-form.component.scss"],
})
export class PlatformConnectionFormComponent extends DirectiveBase implements OnInit {


    @Input()
    formGroup: FormGroup;

    @Output()
    submission = new EventEmitter<any>();

    checkInProgress = false;

    constructor(private settings: SettingsService,
                private api: PlatformAPI,
                private profile: UserPreferencesService,
                private system: SystemService) {

        super();
    }

    ngOnInit() {

        if (!this.formGroup) {
            this.formGroup = new FormGroup({});
        }

        this.formGroup.addControl(
            "url",
            new FormControl("", [Validators.required, Validators.pattern("https://[^/?]+\.[^.]+\\.sbgenomics\\.com")])
        );

        this.formGroup.addControl(
            "token",
            new FormControl("", [(control) => {

                if (control.value.length === 32) {
                    return null;
                }

                return {length: "Authentication token must be 32 characters long."};
            }]));

        this.tracked = this.profile.get("credentials", [{
            label: "Seven Bridges",
            profile: "default",
            url: "https://igor.sbgenomics.com",
            sessionID: null,
            token: "",
        }])
            .filter(c => c.length > 0)
            .subscribe(credentials => {
                console.log("Got credentials", credentials[0], "form group", this.formGroup);
                this.formGroup.patchValue(credentials[0]);
            });


        this.formGroup.statusChanges
            .debounceTime(300)
            .filter(status => status === "VALID")
            .do(_ => this.checkInProgress = true)
            .flatMap(_ => this.api.checkToken(this.formGroup.value.url, this.formGroup.value.token).map(res => {
                if (res === true) {
                    return null;
                }

                if (res === false) {
                    return {invalidKey: true};
                }

                if (res === "invalid_platform") {
                    return {invalidPlatform: true};
                }


            }))
            .subscribe(err => {
                if (err) {
                    this.formGroup.setErrors(err);
                }
                this.checkInProgress = false;
            });

        this.formGroup.statusChanges.map(s => s === "VALID").subscribe(this.settings.validity);
    }

    onSubmit() {
        const profile = this.formGroup.get("url").value.match("https:\/\/(.*?)\.sbgenomics\.com")[1];

        this.profile.put("credentials", [{
            profile: profile === "igor" ? "default" : profile,
            ...this.formGroup.getRawValue()
        }]).subscribe(val => {
            this.submission.emit(val);
        });
    }

    openTokenPage() {
        let url = "https://igor.sbgenomics.com/developer/#token";
        if (this.formGroup.controls["url"].valid) {
            url = this.formGroup.controls["url"].value + "/developer/#token";
        }

        this.system.openLink(url);
    }

    /**
     * Checks if the given control value matches some patterns for vayu and platform names
     * and updates the control values if the do
     * @param control
     */
    expandPlatformUrl(control: AbstractControl) {

        const httpCheck = /^https?:\/\//gi;

        if (!httpCheck.test(control.value) && control.value.length > 2) {
            control.setValue(`https://${control.value}.sbgenomics.com`);
        }
    }

}
