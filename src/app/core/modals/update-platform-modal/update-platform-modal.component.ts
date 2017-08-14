import {Component, Input} from "@angular/core";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {SystemService} from "../../../platform-providers/system.service";

@Component({
    selector: "ct-update-platform-modal",
    styleUrls: ["update-platform-modal.component.scss"],
    template: `
        <div class="body">

            <div class="dialog-content">
                <div [ct-markdown]="description" *ngIf="platformIsOutdated; else upToDate">
                </div>
            </div>

            <ng-template #upToDate>
                Your platform is up to date!
            </ng-template>

            <!--Footer-->
            <div class="footer pr-1 pb-1">

                <button type="button" class="btn btn-secondary" data-test='cancel-button'
                        (click)="onCancel()">Cancel
                </button>

                <button *ngIf="platformIsOutdated" type="button" class="btn btn-primary" data-test='download-button'
                        (click)="onDownload()">Download
                </button>
            </div>

        </div>
    `
})
export class UpdatePlatformModalComponent extends DirectiveBase {

    @Input()
    platformIsOutdated = false;

    @Input()
    description: string;

    @Input()
    downloadLink: string;

    constructor(private modal: ModalService, private system: SystemService) {
        super();
    }

    onDownload() {
        this.system.openLink(this.downloadLink);
        this.modal.close();
    }

    onCancel() {
    }
}
