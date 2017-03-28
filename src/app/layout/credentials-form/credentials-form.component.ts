import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ConnectionState, CredentialsEntry} from "app/services/storage/user-preferences-types";
import {AuthService} from "../../auth/auth/auth.service";

@Component({
    selector: "ct-credentials-form",
    template: `
        <form class="auth-form" (ngSubmit)="applyValues()" [formGroup]="form">

            <div class="row">
                <label class="strong col-xs-5">Seven Bridges Platform URL</label>
                <label class="strong col-xs-6">Developer Token</label>
            </div>

            <div *ngFor="let pair of form.get('pairs').controls; let i = index;" class="row" [class.has-success]="pair.valid">

                <div class="form-group col-xs-5" [class.has-danger]="pair.dirty && pair.get('url').invalid">

                    <input class="form-control" [formControl]="pair.get('url')" (blur)="expandPlatformUrl(pair.controls.url)"/>

                    <div class="form-control-feedback" *ngIf="pair.dirty && pair.get('url').errors?.pattern">
                        Invalid Platform Name. Try with <i>“https://igor.sbgenomics.com”</i>.
                    </div>
                </div>

                <div class="form-group col-xs-6" [class.has-danger]="pair.dirty && pair.get('token').invalid">
                    <input class="form-control" [formControl]="pair.controls.token"/>

                    <div class="form-control-feedback" *ngIf="pair.dirty && pair.get('token').errors?.length">
                        The Authentication Key must be 32 characters long.
                    </div>
                </div>
                <div *ngIf="removable" class="col-xs-1 form-control-static clickable" (click)="removeIndex(i)">
                    <i class="fa fa-trash"></i>
                </div>
            </div>
        </form>
    `,
    styleUrls: ["./credentials-form.component.scss"],
})
export class CredentialsFormComponent implements OnInit {

    form: FormGroup;

    @Input()
    valueArray = new FormArray([]);

    @Output()
    onSubmit = new EventEmitter<CredentialsEntry[]>();

    @Input()
    removable = true;

    constructor(private preferences: UserPreferencesService) {

        this.form = new FormGroup({
            pairs: this.valueArray || new FormArray([])
        });

        this.preferences.getCredentials().take(1).subscribe(credentials => {
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

    applyValues() {
        const values = this.form.get("pairs").value.map(val => {
            const hash    = AuthService.hashUrlTokenPair(val.url, val.token);
            const profile = AuthService.urlToProfile(val.url);
            return {...val, hash, profile, status: ConnectionState.Connecting};
        }).filter((item, index, arr) => {
            return arr.findIndex(it => it.hash === item.hash) === index;
        });
        this.onSubmit.emit(values);

        this.preferences.patchCredentials(values);
    }

}
