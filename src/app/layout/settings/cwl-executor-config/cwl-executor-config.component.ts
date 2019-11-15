import {Observable} from "rxjs/Observable";
import {Component, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {ExecutorService} from "../../../executor-service/executor.service";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {NotificationBarService} from "../../notification-bar/notification-bar.service";
import {ElectronProxyService} from "../../../native/proxy/electron-proxy.service";
import {debounceTime, combineLatest, map, take} from "rxjs/operators";

@Component({
    selector: "ct-cwl-executor-config",
    styleUrls: ["./cwl-executor-config.component.scss"],
    styles: [`
        :host {
            display: block;
        }`
    ],
    template: `
        <form [formGroup]="formHistory" *ngIf="formHistory">
            <label>Configurations from past executions:</label>
            <select formControlName="config" class="form-control">
                <option value="">-- none --</option>
                <option *ngFor="let config of configHistory" [ngValue]="config">
                    {{config.executorPath +' '+ config.outDir.prefix +' '+ config.outDir.value +' '+ config.executorParams}}
                </option>
            </select>
            <p></p>
        </form>
        <form [formGroup]="form" *ngIf="form">

            <div class="form-check">

                <label>Executor path:</label>
                <input formControlName="executorPath"
                       class="form-control"
                       type="text"/>
                <p class="form-text text-muted">{{ versionMessage }}</p>

                <label>Output folder:</label>
                <div>
                    <div formGroupName="outDir" class="output-folder-container">
                        <div>
                            <label>Prefix:</label>
                            <input formControlName="prefix"
                                   class="form-control output-folder-prefix-input"
                                   type="text"/>
                        </div>
                        <div>
                            <label>Folder:</label>
                            <ct-native-file-browser-form-field class="input-group"
                                                               formControlName="value"
                                                               [disableTextInput]="false"
                                                               [hidden]=""
                                                               selectionType="directory">
                            </ct-native-file-browser-form-field>
                        </div>
                    </div>
                    <button *ngIf="outDirExistsInTree | async" class="btn btn-link add-output-folder-btn" (click)="addOutputFolderToTree()">
                        Add this folder to the file tree
                    </button>
                    <p class="form-text text-muted">Configure prefix according to the given executor requirements.</p>
                </div>

                <label>Other parameters:</label>
                <input formControlName="executorParams"
                       class="form-control"
                       type="text"/>
                <p class="form-text text-muted">Specify additional parameters to be passed to the executor.</p>
            </div>

        </form>
    `,
})
export class CWLExecutorConfigComponent extends DirectiveBase implements OnInit {

    form: FormGroup;
    formHistory: FormGroup;

    versionMessage = "checking...";

    outDirExistsInTree: Observable<boolean>;

    config;
    configHistory = [];

    constructor(private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                private electronProxy: ElectronProxyService,
                public executorService: ExecutorService) {
        super();
    }

    ngOnInit() {

        const showErr = (err) => this.notificationBar.showNotification(new ErrorWrapper(err).toString());

        this.localRepository.getCWLExecutorConfigHistory().pipe(
            take(1)
        ).subscribeTracked(this, configs => {
            this.configHistory = configs;
        });

        this.localRepository.getCWLExecutorConfig().pipe(
            take(1)
        ).subscribeTracked(this, config => {
            this.config = config;

            this.formHistory = new FormGroup({
                config: new FormControl("")
            })

            const changesHistory = this.formHistory.valueChanges;

            changesHistory.pipe(
                debounceTime(300)
            ).subscribeTracked(this, () => {
                /** Update the form with a past execution config, otherwise
                use the current config */
                if (this.formHistory.get("config").value) {
                    this.form.patchValue(this.formHistory.get("config").value);
                } else {
                    this.form.patchValue(this.config);
                }
            }, showErr);

            this.form = new FormGroup({
                executorPath: new FormControl(this.config.executorPath, [Validators.required]),
                outDir: new FormGroup({
                    prefix: new FormControl(this.config.outDir.prefix),
                    value: new FormControl(this.config.outDir.value)
                }),
                executorParams: new FormControl(this.config.executorParams)
            });

            this.form.get("executorPath").valueChanges.subscribeTracked(this, () => {
                this.versionMessage = "checking...";
                this.checkVersion();
            });

            const changes = this.form.valueChanges;

            changes.pipe(
                debounceTime(300)
            ).subscribeTracked(this, () => {
                /** Update current config when user is not currently
                viewing a past execution config */
                if (!this.formHistory.get("config").value) {
                    this.config = this.form.getRawValue();
                }
                this.localRepository.setCWLExecutorConfig(this.form.getRawValue());
            }, showErr);

            this.outDirExistsInTree = this.localRepository.getLocalFolders().pipe(
                combineLatest(this.localRepository.getCWLExecutorConfig().pipe(
                    map(config => config.outDir)
                )),
                map(result => {
                    const [folders, outDir] = result;
                    return outDir.value && !~folders.indexOf(outDir.value);
                })
            );

        }, showErr);

        this.checkVersion();
    }

    addOutputFolderToTree() {
        this.electronProxy.getRemote().require("fs-extra").ensureDir((this.form.get("outDir.value").value))
            .then(() => {
                this.localRepository.addLocalFolders([this.form.get("outDir.value").value], true)
                    .then(() => {
                    });
            }).catch((err) => console.warn(err));
    }

    checkVersion() {
        this.executorService.getVersion().subscribeTracked(this, version => {

            this.versionMessage = version || "Not available";

            if (version.startsWith("Version: ")) {
                this.form.get("executorPath").setErrors(null);
            } else {
                this.form.get("executorPath").setErrors({probe: version});
            }

        }, err => {
            console.warn("Probe unhandled error", err);
        });
    }
}
