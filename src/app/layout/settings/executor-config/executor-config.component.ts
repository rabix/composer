import {Observable} from "rxjs/Observable";
import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {ExecutorService} from "../../../executor/executor.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {NotificationBarService} from "../../notification-bar/notification-bar.service";
import {ElectronProxyService} from "../../../native/proxy/electron-proxy.service";

@Component({
    selector: "ct-executor-config",
    styleUrls: ["./executor-config.component.scss"],
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
                        <input type="radio" class="form-check-input" value="custom" formControlName="choice"
                               name="choice" #radio/>
                        Custom

                        <ng-container *ngIf="form.get('choice').value === 'custom'">
                            <ct-native-file-browser-form-field class="input-group mt-1"
                                                               [disableTextInput]="true"
                                                               [hidden]=""
                                                               formControlName="path"></ct-native-file-browser-form-field>

                            <p class="form-text text-muted">{{ versionMessage }}</p>
                        </ng-container>
                    </label>
                </div>

                <label>Output folder:</label>
                <ct-native-file-browser-form-field class="input-group"
                                                   formControlName="outDir"
                                                   [disableTextInput]="true"
                                                   [hidden]=""
                                                   selectionType="directory">
                </ct-native-file-browser-form-field>

                <button *ngIf="outDirExistsInTree | async" class="btn btn-link add-output-folder-btn" (click)="addOutputFolderToTree()">
                    Add this folder to the file tree
                </button>

            </div>


        </form>
    `,
})
export class ExecutorConfigComponent extends DirectiveBase implements OnInit {

    form: FormGroup;

    versionMessage = "Version: checking...";

    outDirExistsInTree: Observable<boolean>;

    constructor(private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                private electronProxy: ElectronProxyService,
                public executorService: ExecutorService) {
        super();
    }

    ngOnInit() {

        const showErr = (err) => this.notificationBar.showNotification(new ErrorWrapper(err).toString());

        this.localRepository.getExecutorConfig().take(1).subscribeTracked(this, config => {

            this.form = new FormGroup({
                path: new FormControl(config.path, [Validators.required]),
                choice: new FormControl(config.choice, [Validators.required]),
                outDir: new FormControl(config.outDir)
            });

            const changes = this.form.valueChanges;

            this.outDirExistsInTree = this.localRepository
                .getLocalFolders().combineLatest(this.form.get("outDir").valueChanges.startWith(this.form.get("outDir").value))
                .map(result => {
                    const [folders, outDir] = result;
                    return !~folders.indexOf(outDir);
                });

            this.form.get("path").valueChanges.subscribeTracked(this, () => this.versionMessage = "checking...");

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

    addOutputFolderToTree() {
        this.electronProxy.getRemote().require("fs-extra").ensureDir((this.form.get("outDir").value))
            .then(() => {
                this.localRepository.addLocalFolders([this.form.get("outDir").value], true)
                    .then(() => {});
            }).catch((err) => console.warn(err));
    }
}
