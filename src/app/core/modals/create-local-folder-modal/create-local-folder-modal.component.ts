import {Component, Input, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {FormAsyncValidator} from "../../forms/helpers/form-async-validator";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";

@Component({
    selector: "ct-create-local-folder-modal",
    styleUrls: ["./create-local-folder-modal.component.scss"],
    template: `
        <form [formGroup]="form" (submit)="onSubmit(form.getRawValue())">

            <div class="p-1">
                <div class="form-group">
                    <label>Folder Name:</label>
                    <input autofocus="true" class="form-control" formControlName="folderName"/>
                </div>

                <div class="alert alert-warning" *ngIf="form.hasError('exists', 'folderName')">
                    Folder with this name already exists. Please choose another name.
                </div>

                <div class="alert alert-warning" *ngIf="form.hasError('invalidName', 'folderName')">
                    {{ form.getError('invalidName', 'folderName') }}
                </div>

                <div class="alert alert-danger" *ngIf="form.hasError('creationFailure')">
                    {{ form.getError('creationFailure') }}
                </div>


            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="!form.valid">
                    <ct-loader-button-content [isLoading]="form.pending">Create</ct-loader-button-content>
                </button>
            </div>

        </form>
    `
})
export class CreateLocalFolderModalComponent extends DirectiveBase implements OnInit {
    @Input()
    rootFolder: string;

    error: string;
    form: FormGroup;

    constructor(private dataGateway: DataGatewayService,
                private localFileRepository: FileRepositoryService,
                public modal: ModalService) {
        super();
    }

    hasFolderNameAsyncValidator(control: FormControl) {
        return new Promise(resolve => {

            this.dataGateway.checkIfPathExists(this.rootFolder + "/" + control.value).take(1)
                .subscribeTracked(this, (val) => {
                    if (val.exists) {
                        resolve({exists: true});
                    } else {
                        resolve(null);
                    }
                });
        });
    }

    onSubmit() {
        const fullPath = `${this.rootFolder}/${this.form.get("folderName").value}`;

        this.dataGateway
            .createLocalFolder(fullPath).take(1)
            .subscribeTracked(this, () => {
                this.localFileRepository.reloadPath(this.rootFolder);
                this.modal.close();
            }, err => {
                this.form.setErrors({
                    creationFailure: err.message
                })
            });
    }

    ngOnInit() {

        this.form = new FormGroup({
            folderName: new FormControl("",
                [
                    Validators.required,
                    (control: FormControl) => {
                        const hasIllegalChar = new RegExp("[‘“!#$%&+^<=>`]").exec(control.value);

                        if (!hasIllegalChar) {
                            return null;
                        }

                        const invalidName = `Invalid character “${hasIllegalChar[0]}” at index ${hasIllegalChar.index}.`;
                        return {invalidName};

                    }
                ],
                FormAsyncValidator.debounceValidator(this.hasFolderNameAsyncValidator.bind(this))
            )
        });
    }
}
