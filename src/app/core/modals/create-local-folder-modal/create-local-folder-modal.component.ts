import {Component, Input, OnInit} from "@angular/core";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {FormAsyncValidator} from "../../forms/helpers/form-async-validator";
import {take} from "rxjs/operators";

@Component({
    selector: "ct-create-local-folder-modal",
    styleUrls: ["./create-local-folder-modal.component.scss"],
    template: `
        <form [formGroup]="form" (submit)="onSubmit()">

            <div class="p-1">
                <div class="form-group">
                    <label>Folder Name:</label>
                    <input autofocus class="form-control" formControlName="folderName"/>
                </div>

                <div *ngIf="form.hasError('exists', ['folderName'])">
            <span class="text-warning">
                <i class="fa fa-warning fa-fw"></i>    
                    Folder with this name already exists. Please choose another name.
            </span>
                </div>

                <div *ngIf="form.hasError('invalidName', ['folderName'])">
            <span class="text-warning">
                <i class="fa fa-warning fa-fw"></i>    
                    {{ form.getError('invalidName', 'folderName') }}
            </span>
                </div>

                <div *ngIf="form.hasError('creationFailure')">
            <span class="text-danger">
                <i class="fa fa-times-circle fa-fw"></i>
                    {{ form.getError('creationFailure') }}
            </span>
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

            this.dataGateway.checkIfPathExists(this.rootFolder + "/" + control.value).pipe(
                take(1)
            ).subscribeTracked(this, (val) => {
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

        this.dataGateway.createLocalFolder(fullPath).pipe(
            take(1)
        ).subscribeTracked(this, () => {
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
