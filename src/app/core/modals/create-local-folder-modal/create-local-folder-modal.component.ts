import {Component, Input, OnInit} from "@angular/core";
import {FormControl, Validators} from "@angular/forms";

import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: 'ct-create-local-folder-modal',
    template: `        
        <div class="p-1">

            <div class="form-group">
                <label class="">Folder Name:</label>
                <input class="form-control" type="text" [formControl]="folderName"/>
            </div>

            <div class="alert alert-danger" *ngIf="folderName.errors && folderName.errors.exists">
                This folder name already exists. Choose another name!
            </div>
        </div>

        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="modal.close()"> Cancel</button>
            <button type="button"
                    class="btn btn-primary"
                    (click)="createFolder()"
                    [disabled]="folderName.invalid">
                Create
            </button>
        </div>
    `
})
export class CreateLocalFolderModalComponent implements OnInit {
    @Input() folderPath: string;
             folderName: FormControl;
             error: string;
             checking = false;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService) {
    }

    hasFolderNameAsyncValidator(control: FormControl) {
        return new Promise(resolve => {

            this.dataGateway.checkIfPathExists(this.folderPath + "/" + control.value)
                .subscribe((val) => {
                if (val.exists) {
                    resolve({"exists": true});
                } else {
                    resolve(null);
                }
            });
        });
    }

    createFolder() {
        this.dataGateway.createLocalFolder(this.folderPath + "/" + this.folderName.value).subscribe(() => {
            this.dataGateway.invalidateFolderListing(this.folderPath);
            this.modal.close();
        });
    }

    ngOnInit() {
        this.folderName = new FormControl("",
            [Validators.required, Validators.pattern('^[a-zA-Zа-яА-Я0-9_!]+$')],
            [this.hasFolderNameAsyncValidator.bind(this)]);
    }
}
