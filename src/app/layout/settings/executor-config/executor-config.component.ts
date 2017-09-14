import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {ExecutorService} from "../../../executor/executor.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ErrorNotification, NotificationBarService} from "../../notification-bar/notification-bar.service";

@Component({
    selector: "ct-executor-config",
    styles: [`
        :host {
            display: block;
        }`
    ],
    template: `
        <form [formGroup]="form" *ngIf="form">
            <div>
                <label>Rabix Executor Path</label>
            </div>

            <ct-native-file-browser-form-field class="input-group" formControlName="path"></ct-native-file-browser-form-field>

            <p class=" form-text text-muted">{{ versionMessage }}</p>

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

        const showErr = (err) => this.notificationBar.showNotification(new ErrorNotification(new ErrorWrapper(err).toString()));

        this.localRepository.getExecutorConfig().take(1).subscribeTracked(this, config => {

            this.form     = new FormGroup({
                path: new FormControl(config.path, [Validators.required])
            });
            const changes = this.form.valueChanges;


            changes.subscribeTracked(this, () => this.versionMessage = "checking...");

            changes.debounceTime(300).subscribeTracked(this, () => {
                this.localRepository.setExecutorConfig(this.form.getRawValue());
            }, showErr);

        }, showErr);

        this.executorService.getVersion()
            .subscribeTracked(this, (version) => {
                this.versionMessage = version || "Version: not available";
                if (version.startsWith("Version")) {
                    this.form.get("path").setErrors(null);
                } else {
                    this.form.get("path").setErrors({
                        probe: version
                    });
                }

            }, err => {
                console.warn("Probe unhandled error", err);
            });
    }
}
