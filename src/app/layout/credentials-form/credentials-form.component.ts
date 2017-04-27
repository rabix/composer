import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {ConnectionState, CredentialsEntry} from "app/services/storage/user-preferences-types";
import {AuthService} from "../../auth/auth/auth.service";

@Component({
    selector: "ct-credentials-form",
    styleUrls: ["./credentials-form.component.scss"],
    template: `
        <form class="auth-form" data-test="form" (ngSubmit)="submit()" [formGroup]="form">

            <div class="row">
                <label class="strong col-xs-5">Seven Bridges Platform URL</label>
                <label class="strong col-xs-6">Developer Token</label>
            </div>

            <div *ngFor="let pair of getPairControls(); let i = index;"
                 class="row mb-1"
                 data-test="credentials-entry">

                <div class="col-xs-5" [class.has-danger]="pair.dirty && pair.get('url').invalid">

                    <input class="form-control"
                           data-test="url-field"
                           [class.has-warning]="pair.get('url').invalid"
                           [formControl]="pair.get('url')" (blur)="expandPlatformUrl(pair.get('url'))"/>

                    <div class="form-control-feedback" *ngIf="pair.dirty && pair.get('url').errors?.pattern">
                        Invalid Platform Name. Try with <i>“https://igor.sbgenomics.com”</i>.
                    </div>
                </div>

                <div class="col-xs-5 pr-0" [class.has-danger]="pair.dirty && pair.get('token').invalid">
                    <input data-test="token-field" #tin class="form-control" type="password" [formControl]="pair.get('token')"/>

                    <div class="form-control-feedback" *ngIf="pair.dirty && pair.get('token').errors?.length">
                        The Authentication Key must be 32 characters long.
                    </div>
                </div>

                <div class="col-xs-2 deep-unselectable">

                    <!--Eye icon that covers and uncovers the password-->
                    <button class="btn btn-icon" data-test="token-cover-toggle" type="button"
                            (click)="tin.type = tin.type === 'text' ? 'password' : 'text'">
                        <i class="fa" [class.fa-eye]="tin.type === 'text'" [class.fa-eye-slash]="tin.type === 'password'"></i>
                    </button>

                    <!--Thrash can (delete button)-->
                    <button *ngIf="removable" class="btn btn-icon" data-test="delete-handle" type="button" (click)="removeIndex(i)">
                        <i class="fa fa-trash"></i>
                    </button>


                </div>
            </div>
        </form>
    `
})
export class CredentialsFormComponent implements OnInit, OnChanges {

    /** Whether entries can be removed from the list. Disabling is useful when using this component outside the settings page. */
    @Input() removable = true;

    @Input() credentials: Partial<CredentialsEntry>[] = [];

    /** Emits an event each time the form is submitted. */
    @Output() onSubmit = new EventEmitter<CredentialsEntry[]>();

    /** Holds the main form that the component operates on. */
    form = new FormGroup({pairs: new FormArray([])});

    constructor() {
    }

    ngOnInit() {
        this.updateFormArrayWithCredentials();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.credentials) {
            this.updateFormArrayWithCredentials();
        }
    }

    private updateFormArrayWithCredentials() {
        this.form.setControl("pairs", new FormArray([]));
        this.addEntry();

        if (this.credentials.length > 1) {
            for (let i = 0; i < this.credentials.length - 1; i++) {
                this.addEntry();
            }
        }

        this.form.get("pairs").patchValue(this.credentials || []);
    }

    /**
     * Inserts a new key-token pair to the end of the form
     */
    addEntry(): void {

        const pairs = this.form.get("pairs") as FormArray;

        (this.form.get("pairs") as FormArray).push(new FormGroup({

            url: new FormControl("https://igor.sbgenomics.com",
                [Validators.required, Validators.pattern("https://[^/?]+\.[^.]+\\.sbgenomics\\.com")]),

            token: new FormControl("", [Validators.required, (control) => {
                if (String(control.value).length === 32) {
                    return null;
                }
                return {length: "Authentication token must be 32 characters long."};
            }])
        }));
    }

    submit() {
        if (this.form.invalid) {
            return;
        }

        this.applyValues();
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

    /**
     * Pushes values from the form into the authentication service
     */
    applyValues(): void {
        const values = this.form.get("pairs").value.map(val => {
            const hash    = AuthService.hashUrlTokenPair(val.url, val.token);
            const profile = AuthService.urlToProfile(val.url);

            return {...val, hash, profile, status: ConnectionState.Connecting};
        }).filter((item, index, arr) => {
            return arr.findIndex(it => it.hash === item.hash) === index;
        });

        this.onSubmit.emit(values);
    }

    getPairControls(): AbstractControl[] {
        return (this.form.get("pairs") as FormArray).controls;
    }

}
