import {Component, Input} from "@angular/core";
import {Subject} from "rxjs/Subject";

import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    selector: "ct-create-local-folder-modal",
    template: `
        <div class="p-1">
            <p>
                If you make changes to this copy of {{ appName }},
                you will stop receiving notifications when the original app is updated.
            </p>
        </div>

        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="close()">Cancel</button>
            <button type="button"
                    class="btn btn-primary"
                    (click)="proceedToEditing()">
                Proceed to Editing
            </button>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            width: 440px;
        }
    `]
})
export class ProceedToEditingModalComponent {
    @Input()
    appName: string;

    response: Subject<boolean>;

    constructor(public modal: ModalService) {
        this.response = new Subject<boolean>();
    }

    proceedToEditing() {
        this.response.next(true);
        this.modal.close();
    }

    close() {
        this.modal.close();
    }
}

