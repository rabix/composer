import {Component, Input, Output} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {ModalService} from "../../../ui/modal/modal.service";

@Component({
    styleUrls: ["closing-dirty-apps-modal.component.scss"],
    selector: "ct-modal-closing-dirty-apps",
    template: `
        <form (ngSubmit)="decision.next(true)">
            <div class="body p-1">
                <span> Do you want to save the changes made to the document?<br/>
                Your changes will be lost if you don't save them.</span>
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-secondary discard-button"
                        (click)="decision.next(false)" data-test="dirty-app-modal-discard-button" type="button">{{ discardLabel }}
                </button>

                <button class="btn btn-secondary" data-test="dirty-app-modal-cancel-button" (click)="onCancel()" type="button">{{ cancellationLabel }}
                </button>
                <button class="btn btn-primary" data-test="dirty-app-modal-save-button" type="submit">{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class ClosingDirtyAppsModalComponent {

    @Input()
    public content: string;

    @Input()
    public cancellationLabel: string;

    @Input()
    public confirmationLabel: string;

    @Input()
    public discardLabel: string;

    @Output()
    public decision = new Subject<boolean>();

    constructor(private modal: ModalService) {
        this.content = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";
        this.discardLabel = "Don't";
    }

    onCancel() {
        this.modal.close();
    }
}
