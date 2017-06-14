import {Component, Input} from "@angular/core";

import {ModalService} from "../../../ui/modal/modal.service";
import {Subject} from "rxjs/Subject";

@Component({
    selector: 'ct-create-local-folder-modal',
    template: `
        <div class="p-1">
            <p>
                If you make changes to this copy of {{ appName }},
                you will stop receiving notifications when the original app is updated.
            </p>
        </div>

        <div class="modal-footer">
            <button type="button"
                    class="btn btn-primary"
                    (click)="proceedToEditing()">
                Proceed to Editing
            </button>
            <button type="button" class="btn btn-secondary" (click)="modal.close()">Cancel</button>
        </div>
    `
})
export class ProceedToEditingModalComponent {
    @Input()
    appName: string;

    public response: Subject<boolean>;

    constructor(public modal: ModalService) {
        this.response = new Subject<boolean>();
    }

    proceedToEditing() {
        this.response.next(true);
        this.modal.close();
    }
}

