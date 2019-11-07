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
        <form [formGroup]="form" *ngIf="form">

            <div class="form-check">

                <label>CWL executor path:</label>
                <input formControlName="executorPath"
                       class="form-control"
                       type="text"/>
                <p class="form-text text-muted">{{ versionMessage }}</p>

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
export class CWLExecutorConfigComponent extends DirectiveBase implements OnInit {

    form: FormGroup;

    versionMessage = "checking...";

    outDirExistsInTree: Observable<boolean>;

    constructor(private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                private electronProxy: ElectronProxyService,
                public executorService: ExecutorService) {
        super();
    }

    ngOnInit() {

        const showErr = (err) => this.notificationBar.showNotification(new ErrorWrapper(err).toString());

        this.localRepository.getCWLExecutorConfig().pipe(
            take(1)
        ).subscribeTracked(this, config => {

            this.form = new FormGroup({
                executorPath: new FormControl(config.executorPath, [Validators.required]),
                outDir: new FormControl(config.outDir)
            });

            const changes = this.form.valueChanges;

            this.outDirExistsInTree = this.localRepository.getLocalFolders().pipe(
                combineLatest(this.localRepository.getCWLExecutorConfig().pipe(
                    map(config => config.outDir)
                )),
                map(result => {
                    const [folders, outDir] = result;
                    return !~folders.indexOf(outDir);
                })
            );

            this.form.get("executorPath").valueChanges.subscribeTracked(this, () => {
                this.versionMessage = "checking...";
            });

            changes.pipe(
                debounceTime(300)
            ).subscribeTracked(this, () => {
                this.localRepository.setCWLExecutorConfig(this.form.getRawValue());
                this.checkVersion();
            }, showErr);

        }, showErr);

        this.checkVersion();
    }

    addOutputFolderToTree() {
        this.electronProxy.getRemote().require("fs-extra").ensureDir((this.form.get("outDir").value))
            .then(() => {
                this.localRepository.addLocalFolders([this.form.get("outDir").value], true)
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
