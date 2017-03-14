import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";
import {ModalService} from "../modal.service";
import {SystemService} from "../../../platform-providers/system.service";
import {SettingsService} from "../../../services/settings/settings.service";
import {StepModel} from "cwlts/models";

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-project-selection-modal",
    template: `
        <div>
            <form (ngSubmit)="onSubmit()" class="flex-form">
        
                <div class="modal-body">
                    <p>
                        You are currently using <a href="" (click)="$event.preventDefault(); system.openLink(link)">
                        {{step.label}}</a> (Revision {{step.run.customProps['sbg:latestRevision']}})
                        which has a new update available.
                        <br>
                        Do you want to update this node?
                    </p>
        
                    <div class="alert alert-info" *ngIf="updatedModel['sbg:revisionNotes']">
                        <p><strong>Revision note:</strong></p>
                        <p>"{{ updatedModel['sbg:revisionNotes']}}"</p>
                        <p class="text-muted small">by {{ updatedModel['sbg:modifiedBy'] }}
                            on {{ updatedModel['sbg:modifiedOn'] * 1000 | date : 'MMM d, y hh:mm'}}</p>
                    </div>
        
                    <div class="alert alert-danger" *ngIf="!updatedModel">
                        Failed to retrieve the latest revision of this app.
                    </div>
        
                </div>
        
                <div class="modal-footer">
                    <button class="btn btn-secondary btn-sm" type="button" (click)="onCancel()">Cancel</button>
                    <button class="btn btn-primary btn-sm" type="submit">
                        Update
                    </button>
                </div>
            </form>
        </div>
    `
})
export class UpdateStepModal {

    @Input()
    public step: StepModel;

    @Input()
    public updatedModel: any;

    @Input()
    public confirm: () => void;

    public link;

    constructor(private modal: ModalService, private settings: SettingsService, public system: SystemService) {

    }

    ngOnInit() {

        const urlApp = this.step.run.customProps['sbg:id'];
        const urlProject = urlApp.split('/').splice(0, 2).join('/');

        this.settings.platformConfiguration.first().map(settings => settings.url).subscribe((url) => {
            this.link = `${url}/u/${urlProject}/apps/#${urlApp}`;
        });
    }

    public onSubmit() {
        this.confirm();
    }

    public onCancel() {
        this.modal.close();
    }

    public closeModal() {
        this.modal.close();
    }
}
