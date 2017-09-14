import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {ExecutorService} from "../../../executor/executor.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ErrorNotification, NotificationBarService} from "../../notification-bar/notification-bar.service";

const {dialog} = window["require"]("electron").remote;

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

            <div class="input-group">
                <input #path formControlName="path" class="form-control"/>
                <span class="input-group-btn">
                    <button class="btn btn-secondary" type="button" (click)="findExec()">Browse</button>
                </span>
            </div>
            <p class=" form-text text-muted">{{ versionMessage }}</p>
        </form>
    `,
})
export class ExecutorConfigComponent extends DirectiveBase implements OnInit {

    form: FormGroup;

    isTesting = false;

    versionMessage = "Version: checking...";

    constructor(private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                public executorService: ExecutorService) {
        super();
    }

    private findExec() {
        dialog.showOpenDialog({

            title: "Select a Rabix binary ",
            buttonLabel: "Done",

        }, (path) => {
            if (!path || path.length === 0) {
                return;
            }

            this.form.patchValue({
                path: path[0]
            });
        });
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
