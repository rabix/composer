import {Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AppExecutionContext, ExecutorParamsConfig} from "../../../../electron/src/storage/types/executor-config";
import {AppHelper} from "../../core/helpers/AppHelper";
import {ModalService} from "../../ui/modal/modal.service";
import {NativeSystemService} from "../../native/system/native-system.service";

@Component({
    selector: "ct-app-execution-context-modal",
    template: `
        <form [formGroup]="form" (submit)="onSubmit(form.getRawValue())">

            <div class="p-1">
                
                <div formGroupName="executionParams">

                    <!--Configuration Directory-->
                    <label>Configuration Directory:</label>
                    <div class="form-group col-xs-10 pl-0">
                        <input class="form-control" formControlName="configurationDir"/>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-secondary" (click)="browseFolder('executionParams.configurationDir')">Browse
                        </button>
                    </div>

                    <!--Cache Directory-->
                    <label>Cache Directory:</label>
                    <div class="form-group col-xs-10 pl-0">
                        <input class="form-control" formControlName="cacheDir"/>
                    </div>
                    <div class="form-group">
                        <button type="button" class="btn btn-secondary" (click)="browseFolder('executionParams.cacheDir')">Browse</button>
                    </div>

                    <!--Quiet-->
                    <div class="form-group toggle-group mt-2">
                        <label>Quiet:</label>
                        <ct-toggle-slider class="pull-right" formControlName="quiet"></ct-toggle-slider>
                    </div>

                    <!--Verbose-->
                    <div class="form-group toggle-group">
                        <label>Verbose:</label>
                        <ct-toggle-slider class="pull-right" formControlName="verbose"></ct-toggle-slider>
                    </div>

                    <!--No Container-->
                    <div class="form-group toggle-group">
                        <label>No Container:</label>
                        <ct-toggle-slider class="pull-right" formControlName="noContainer"></ct-toggle-slider>
                    </div>
                </div>


                <!--<div class="alert alert-warning" *ngIf="form.hasError('exists', ['folderName'])">-->
                <!--Folder with this name already exists. Please choose another name.-->
                <!--</div>-->

                <!--<div class="alert alert-warning" *ngIf="form.hasError('invalidName', ['folderName'])">-->
                <!--{{ form.getError('invalidName', 'folderName') }}-->
                <!--</div>-->

                <!--<div class="alert alert-danger" *ngIf="form.hasError('creationFailure')">-->
                <!--{{ form.getError('creationFailure') }}-->
                <!--</div>-->


            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
                <button type="submit" class="btn btn-primary">{{ confirmLabel }}</button>
            </div>

        </form>
    `,
    styleUrls: ["./app-execution-context-modal.component.scss"],
})
export class AppExecutionContextModalComponent implements OnInit {
    @Input()
    context: AppExecutionContext;

    @Input()
    appID: string;

    @Input()
    confirmLabel = "Save";

    form: FormGroup;

    @ViewChild("jobPathInput", {read: ElementRef})
    jobPathInput: ElementRef;


    constructor(private fb: FormBuilder, private modal: ModalService, private native: NativeSystemService) {
    }

    ngOnInit() {

        const {jobPath, executionParams} = this.context;

        const isLocal = AppHelper.isLocal(this.appID);

        this.form = this.fb.group({
            jobPath: [jobPath, [Validators.required]],
            executionParams: this.fb.group(Object.assign({
                outDir: "",
                baseDir: "",
                cacheDir: "",
                configurationDir: "",
                quiet: false,
                verbose: false,
                noContainer: false
            } as ExecutorParamsConfig, executionParams))
        });

        const baseDir = this.form.get("executionParams.baseDir");

        if (!isLocal) {
            baseDir.setValidators([Validators.required])
        } else if (isLocal && !baseDir.value) {
            baseDir.setValue(AppHelper.getDirname(this.appID));
        }
    }

    onSubmit(raw: AppExecutionContext) {

    }

    onCancel() {
        this.modal.close();
    }

    browseJobFile() {
        this.native.openFileChoiceDialog({

            title: "Choose a Job File",
            defaultPath: this.appID,
            buttonLabel: "Done",

        }).then((path) => {
            if (!path || path.length === 0) {
                return;
            }

            this.form.get("jobPath").patchValue(path[0]);
        }, () => {});
    }

    browseFolder(formFieldName: string) {

        this.native.openFolderChoiceDialog({
            properties: ["openDirectory"],
            title: "Choose a Folder",
            defaultPath: this.appID,
            buttonLabel: "Done",

        }).then((path) => {
            if (!path || path.length === 0) {
                return;
            }

            this.form.get(formFieldName).patchValue(path[0]);
        });
    }

}
