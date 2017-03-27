import {Component, OnInit} from "@angular/core";
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../auth/auth/auth.service";
import {SystemService} from "../../platform-providers/system.service";
import {SettingsService} from "../../services/settings/settings.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {ConnectionState} from "../../services/storage/user-preferences-types";

type ViewMode = "auth" | "keyBindings" | "cache";

@Component({
    selector: "ct-settings",
    styleUrls: ["./settings.component.scss"],
    templateUrl: "./settings.component.html"
})
export class SettingsComponent extends DirectiveBase implements OnInit {
    viewMode: ViewMode = "auth";

    form: FormGroup;

    constructor(private settings: SettingsService,
                private profile: UserPreferencesService,
                private system: SystemService,
                private auth: AuthService) {

        super();

        this.form = new FormGroup({
            pairs: new FormArray([])
        });


        this.profile.getCredentials().take(1).subscribe(credentials => {
            (this.form.get("pairs") as FormArray).reset([]);
            this.addEntry();

            if (credentials.length > 1) {
                for (let i = 0; i < credentials.length - 1; i++) {
                    this.addEntry();
                }
            }
            this.form.get("pairs").patchValue(credentials || []);
        });
    }

    ngOnInit() {
        // this.form.statusChanges.debounceTime(300)
        //     .filter(status => status === "VALID")
        //     .flatMap(_ => this.api.checkToken(this.form.value.url, this.form.value.token).map(res => {
        //         if (res === true) {
        //             return null;
        //         }
        //
        //         if (res === false) {
        //             return {invalidKey: true};
        //         }
        //
        //         if (res === "invalid_platform") {
        //             return {invalidPlatform: true};
        //         }
        //
        //
        //     }))
        //     .filter(err => !!err)
        //     .subscribe(err => {
        //         this.form.setErrors(err);
        //     });
        //
        // this.form.statusChanges.map(s => s === "VALID").subscribe(this.settings.validity);
    }

    onSubmit() {
        const values = this.form.get("pairs").value.map(val => {
            const hash    = AuthService.hashUrlTokenPair(val.url, val.token);
            const profile = AuthService.urlToProfile(val.url);
            return {...val, hash, profile, status: ConnectionState.Connecting};
        }).filter((item, index, arr) => {
            return arr.findIndex(it => it.hash === item.hash) === index;
        });

        this.profile.patchCredentials(values);
    }

    /**
     * Opens the authentication token page on SevenBridges.com
     */
    openTokenPage(): void {
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
    expandPlatformUrl(control: AbstractControl): void {

        if (!/^https?:\/\//gi.test(control.value) && control.value.length > 2) {
            control.setValue(`https://${control.value}.sbgenomics.com`);
        }
    }

    /**
     * Changes the view mode
     * @param tab Name of the tab to switch to
     */
    switchTab(tab: ViewMode): void {
        this.viewMode = tab;
    }

    /**
     * Inserts a new key-token pair to the end of the form
     */
    addEntry(): void {
        const pairs = this.form.get("pairs") as FormArray;
        pairs.push(new FormGroup({
            url: new FormControl("https://igor.sbgenomics.com",
                [Validators.required, Validators.pattern("https://[^/?]+\.[^.]+\\.sbgenomics\\.com")]),
            token: new FormControl("", [
                (control) => {
                    if (control.value.length === 32) {
                        return null;
                    }
                    return {length: "Authentication token must be 32 characters long."};
                }
            ])
        }));

    }

    /**
     * Removes a url-token pair at the given index
     * @param i Index of the pair to remove
     */
    removeIndex(i: number): void {
        (this.form.get("pairs") as FormArray).removeAt(i);
    }

}
