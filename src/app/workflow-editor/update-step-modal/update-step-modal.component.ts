import {ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {StepModel} from "cwlts/models";
import {SystemService} from "../../platform-providers/system.service";
import {SettingsService} from "../../services/settings/settings.service";
import {ModalService} from "../../ui/modal/modal.service";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "ct-project-selection-modal",
    template: `
        <div class="p-1">
            <form (ngSubmit)="onSubmit()" class="flex-form">

                <div class="modal-body">
                    <p>
                        You are currently using {{step.label}} (Revision {{step.run.customProps['sbg:latestRevision']}})
                        which has a new update available.
                        <br>
                        Do you want to update this node?
                    </p>

                    <div class="" *ngIf="updatedModel['sbg:revisionNotes']">
                        <p><strong>Revision note:</strong></p>
                        <p>"{{ updatedModel['sbg:revisionNotes']}}"</p>
                        <p class="text-muted small">by {{ updatedModel['sbg:modifiedBy'] }}
                            on {{ updatedModel['sbg:modifiedOn'] * 1000 | date: 'MMM d, y hh:mm'}}</p>
                    </div>

                    <div class="alert alert-danger" *ngIf="!updatedModel">
                        Failed to retrieve the latest revision of this app.
                    </div>

                </div>

                <div class="modal-footer">
                    <button class="btn btn-secondary" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary" type="submit">
                        Update
                    </button>
                </div>
            </form>
        </div>
    `
})
export class UpdateStepModalComponent {

    @Input()
    step: StepModel;

    @Input()
    updatedModel: any;

    @Input()
    confirm: () => void;


    constructor(private modal: ModalService,
                public system: SystemService) {
    }

    onSubmit() {
        this.confirm();
    }

    onCancel() {
        this.modal.close();
    }

    closeModal() {
        this.modal.close();
    }
}
