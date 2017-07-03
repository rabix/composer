import {Component, Input} from "@angular/core";
import {StepModel} from "cwlts/models";
import "rxjs/add/operator/first";
import {RawApp} from "../../../../electron/src/sbg-api-client/interfaces/raw-app";
import {SystemService} from "../../platform-providers/system.service";
import {ModalService} from "../../ui/modal/modal.service";

@Component({
    selector: "ct-project-selection-modal",
    styleUrls: ["./update-step-modal.component.scss"],
    template: `
        <div class="p-1 content">

            <form (ngSubmit)="onSubmit()" class="flex-form" *ngIf="!isLoading; else loader">

                <div class="modal-body">
                    <p>
                        You are currently using {{step.label}} (Revision {{step.run.customProps['sbg:latestRevision']}})
                        which has a new update available.
                        <br>
                        Do you want to update this node?
                    </p>

                    <div class="" *ngIf="updatedApp['sbg:revisionNotes']">
                        <p><strong>Revision note:</strong></p>
                        <p>"{{ updatedApp['sbg:revisionNotes']}}"</p>
                        <p class="text-muted small">by {{ updatedApp['sbg:modifiedBy'] }}
                            on {{ updatedApp['sbg:modifiedOn'] * 1000 | date: 'MMM d, y hh:mm'}}</p>
                    </div>

                    <div class="alert alert-danger" *ngIf="!updatedApp">
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

            <ng-template #loader>
                <div class="loading">
                    <ct-circular-loader></ct-circular-loader>
                    <br/>
                    <p class="text-xs-center">Checking new app version</p>
                </div>
            </ng-template>
        </div>
    `
})
export class UpdateStepModalComponent {

    @Input() error: string;
    @Input() step: StepModel;
    @Input() isLoading = true;
    @Input() updatedApp: RawApp;


    constructor(private modal: ModalService,
                public system: SystemService) {
    }

    onSubmit() {
    }

    onCancel() {
        this.modal.close();
    }

    closeModal() {
        this.modal.close();
    }
}
