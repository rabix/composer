import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {ExecutorService} from "../../../executor/executor.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {NotificationBarService} from "../../notification-bar/notification-bar.service";

@Component({
    selector: "ct-executor-config",
    styles: [`
        :host {
            display: block;
        }`
    ],
    template: `
        <form [formGroup]="form" *ngIf="form">

            <div class="form-check">

                <div class="form-group">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input" value="bundled" formControlName="choice" name="choice"/>
                        Bundled (v1.0.3)
                    </label>
                </div>

                <div class="form-group">
                    <label class="form-check-label">
                        <input type="radio" class="form-check-input" value="custom" formControlName="choice" name="choice" #radio/>
                        Custom

                        <ng-container *ngIf="form.get('choice').value === 'custom'">
                            <ct-native-file-browser-form-field class="input-group mt-1"
                                                               [hidden]=""
                                                               formControlName="path"></ct-native-file-browser-form-field>

                            <p class="form-text text-muted">{{ versionMessage }}</p>
                        </ng-container>
                    </label>
                </div>

            </div>


        </form>
    `,
})
export class ExecutorConfigComponent extends DirectiveBase implements OnInit {

    form: FormGroup;

    versionMessage = "Version: checking...";

    constructor(private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                public executorService: ExecutorService) {
        super();
    }

    ngOnInit() {

        const showErr = (err) => this.notificationBar.showNotification(new ErrorWrapper(err).toString());

        this.localRepository.getExecutorConfig().take(1).subscribeTracked(this, config => {

            this.form = new FormGroup({
                path: new FormControl(config.path, [Validators.required]),
                choice: new FormControl(config.choice, [Validators.required])
            });

            const changes = this.form.valueChanges;

            changes.subscribeTracked(this, () => this.versionMessage = "checking...");

            changes.debounceTime(300).subscribeTracked(this, () => {
                this.localRepository.setExecutorConfig(this.form.getRawValue());
            }, showErr);

        }, showErr);

        this.executorService.getVersion().subscribeTracked(this, version => {

            this.versionMessage = version || "Version: not available";

            if (version.startsWith("Version")) {
                this.form.get("path").setErrors(null);
            } else {
                this.form.get("path").setErrors({probe: version});
            }

        }, err => {
            console.warn("Probe unhandled error", err);
        });
    }
}
