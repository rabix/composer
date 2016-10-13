import {Component, OnInit} from "@angular/core";
import {SettingsService, PlatformSettings} from "../../services/settings/settings.service";
import {FormGroup, FormBuilder, Validators, AbstractControl} from "@angular/forms";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {Subscription} from "rxjs";
import {PlatformProvider} from "../../platform-providers/platform-provider.abstract";

@Component({
    selector: "ct-settings",
    template: `
    <div class="m-a-1">
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
                 [class.has-danger]="form.controls.key.invalid">
                 
                <label class="strong" for="sbgApiKey">Authentication Key</label>
                <input class="form-control form-control-success form-control-danger form-control-warning" 
                       formControlName="key" 
                       id="sbgApiKey"/>
               
                <div class="form-control-feedback" *ngIf="form.controls.key?.errors?.length">
                    The Authentication Key must be 32 characters long.
                </div>
               
                <small class="form-text text-muted">
                    You can generate and see the key on the
                     
                    <a href="" (click)="$event.preventDefault(); openTokenPage()">
                        Seven Bridges Platform
                    </a>
                </small>
            </div>
            
             <div *ngIf="form?.errors?.invalidKey" class="alert alert-warning" >
                <strong>Warning!</strong> This authentication key is not valid on the given platform.
             </div>
             <div *ngIf="form?.errors?.invalidPlatform" class="alert alert-danger" >
                <strong>Danger!</strong> Given platform does not exist.
             </div>
            
            <button type="submit" 
                    class="btn btn-primary" 
                    [disabled]="form.invalid || checkInProgress">Apply</button>
        </form>
    </div>
    `
})
export class SettingsComponent implements OnInit {
    private form: FormGroup;

    private checkInProgress = false;

    private subs: Subscription[] = [];

    constructor(private settings: SettingsService, formBuilder: FormBuilder, private api: PlatformAPI, private platform: PlatformProvider) {

        console.debug("Got platform provider", this.platform);

        this.form = formBuilder.group({
            url: ["", [Validators.required, Validators.pattern("https://[^/?]+\.[^.]+\\.sbgenomics\\.com")]],
            key: ["", [(control) => {

                if (control.value.length === 32) {
                    return null
                }

                return {length: "Authentication Key must be 32 characters long."};
            }]]
        });


        this.subs.push(
            this.settings.platformConfiguration.subscribe((props: PlatformSettings) => {
                Object.keys(props).forEach(key => {
                    if (!this.form.controls[key]) {
                        console.warn(`Trying to set a non existing property: “${key}”`);
                    } else {
                        this.form.controls[key].setValue(props[key]);
                    }
                })
            })
        );

    }

    ngOnInit() {
        console.debug("Initializing settings component");
        this.form.statusChanges.debounceTime(300)
            .filter(status => status === "VALID")
            .flatMap(_ => this.api.checkToken(this.form.value.url, this.form.value.key).map(res => {
                if (res === true) {
                    return null;
                }

                if (res === false) {
                    return {invalidKey: true}
                }

                if (res === "invalid_platform") {
                    return {invalidPlatform: true}
                }


            }))
            .filter(err => err)
            .subscribe(err => {
                this.form.setErrors(err);
            });
    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    private onSubmit() {
        this.settings.platformConfiguration.next(this.form.value);
    }
    
    private openTokenPage(){
        let url = "https://igor.sbgenomics.com/account/#developer";
        if(this.form.controls["url"].valid){
            console.debug("Url is valid");
            url = this.form.controls["url"].value + "/account/#developer";
        }

        this.platform.openLink(url);
    }

    /**
     * Checks if the given control value matches some patterns for vayu and platform names
     * and updates the control values if the do
     * @param control
     */
    private expandPlatformUrl(control: AbstractControl) {

        const httpCheck = /^https?:\/\//gi;

        if (!httpCheck.test(control.value) && control.value.length > 2) {
            control.setValue(`https://${control.value}.sbgenomics.com`);
        }
    }

}