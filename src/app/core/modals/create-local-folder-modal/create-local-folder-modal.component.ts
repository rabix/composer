import {Component, ElementRef, Input, ViewChild} from "@angular/core";

import {DataGatewayService} from "../../data-gateway/data-gateway.service";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: 'ct-create-local-folder-modal',
    template: `        
        <div class="p-1">

            <div class="form-group">
                <label class="">Folder Name:</label>
                <input class="form-control" type="text" #folderName/>
            </div>
        </div>

        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="modal.close()"> Cancel</button>
            <button type="button"
                    class="btn btn-primary"
                    (click)="createFolder()"
                    [disabled]="!folderName.value">
                Create
            </button>
        </div>
    `
})
export class CreateLocalFolderModalComponent {
    @Input() folderPath: string;

    @ViewChild("folderName")
    folderName: ElementRef;

    constructor(private dataGateway: DataGatewayService,
                public modal: ModalService) {
    }

    createFolder() {
        this.dataGateway.createLocalFolder(this.folderPath + "/" + this.folderName.nativeElement.value).subscribe(() => {
            this.dataGateway.invalidateFolderListing(this.folderPath);
            this.modal.close();
        });
    }
}
