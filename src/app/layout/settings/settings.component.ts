import {Component, OnInit} from "@angular/core";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SystemService} from "../../platform-providers/system.service";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {IpcService} from "../../services/ipc.service";
import {SettingsService} from "../../services/settings/settings.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {StatusBarService} from "../status-bar/status-bar.service";

@Component({
    selector: "ct-settings",
    styleUrls: ["./settings.component.scss"],
    template: `

        <div class="m-1">
            <form class="m-t-1"
                  (ngSubmit)="onSubmit()"
                  [formGroup]="form"
                  [class.has-success]="form.valid"
                  [class.has-warning]="form.errors">

                <!--Platform URL Input field-->
                <div class="form-group"
                     [class.has-danger]="form.controls.url.invalid">

                    <label class="strong" for="sbgApiKey">Seven Bridges Platform URL</label>
                    <input class="form-control form-control-success form-control-danger form-control-warning"
                           formControlName="url"
                           (blur)="expandPlatformUrl(form.controls.url)"
                           id="sbgPlatform"
                           placeholder="https://igor.sbgenomics.com"/>

                    <div class="form-control-feedback" *ngIf="form.controls.url?.errors?.pattern">
                        Invalid Platform Name. Try with something like <i>“https://igor.sbgenomics.com”</i>.
                    </div>
                </div>

                <!--Platform Key Input Field-->
                <div class="form-group"
                     [class.has-danger]="form.controls.token.invalid">

                    <label class="strong" for="sbgApiKey">Authentication Key</label>
                    <input class="form-control form-control-success form-control-danger form-control-warning"
                           formControlName="token"
                           id="sbgApiKey"/>

                    <div class="form-control-feedback" *ngIf="form.controls.token?.errors?.length">
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
                    <strong>Warning!</strong> This authentication key is not valid on the given platform.
                </div>
                <div *ngIf="form?.errors?.invalidPlatform" class="alert alert-danger">
                    <strong>Danger!</strong> Given platform does not exist.
                </div>

                <button type="submit"
                        class="btn btn-primary"
                        [disabled]="checkInProgress">Apply
                </button>
            </form>
        </div>
    `
})
export class SettingsComponent extends DirectiveBase implements OnInit {
    form: FormGroup;

    checkInProgress = false;

    constructor(private settings: SettingsService,
                private api: PlatformAPI,
                private ipc: IpcService,
                private profile: UserPreferencesService,
                private system: SystemService,
                private status: StatusBarService,
                formBuilder: FormBuilder) {

        super();

        this.form = formBuilder.group({
            url: ["", [Validators.required, Validators.pattern("https://[^/?]+\.[^.]+\\.sbgenomics\\.com")]],
            token: ["", [(control) => {

                if (control.value.length === 32) {
                    return null;
                }

                return {length: "Authentication token must be 32 characters long."};
            }]]
        });

        this.tracked = this.profile.get("credentials").subscribe(credentials => {
            this.form.patchValue(credentials[0]);
        });
    }

    ngOnInit() {
        this.form.statusChanges.debounceTime(300)
            .filter(status => status === "VALID")
            .flatMap(_ => this.api.checkToken(this.form.value.url, this.form.value.token).map(res => {
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
            .filter(err => !!err)
            .subscribe(err => {
                this.form.setErrors(err);
            });

        this.form.statusChanges.map(s => s === "VALID").subscribe(this.settings.validity);
    }

    onSubmit() {
        const profile = this.form.get("url").value.match("https:\/\/(.*?)\.sbgenomics\.com")[1];
        this.profile.put("credentials", [{
            profile: profile === "igor" ? "default" : profile,
            ...this.form.getRawValue()
        }]).take(1).subscribe((credentials) => {

            const process = this.status.startProcess("Fetching platform data...", "Platform data fetched.");
            this.ipc.request("scanPlatforms", {credentials}).take(1).subscribe(() => {
                this.status.stopProcess(process);
            });
        });

        // this.settings.platformConfiguration.next(this.form.value);
    }

    openTokenPage() {
        let url = "https://igor.sbgenomics.com/developer/#token";
        if (this.form.controls["url"].valid) {
            url = this.form.controls["url"].value + "/developer/#token";
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
