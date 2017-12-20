import {Component, Input} from "@angular/core";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {SystemService} from "../../../platform-providers/system.service";

@Component({
    selector: "ct-update-platform-modal",
    styleUrls: ["update-platform-modal.component.scss"],
    template: `
        <div class="body">

            <div class="header">
                
                <div class="logo-img mb-1">
                </div>

                <div class="header-text">                    
                    <ng-container *ngIf="platformIsOutdated; else upToDate">
                        A new version of Rabix Composer is available!
                    </ng-container>

                    <ng-template #upToDate>
                        Rabix Composer is up to date!
                    </ng-template>
                    
                </div>
            </div>

            <div class="dialog-content">

                <ng-container *ngIf="platformIsOutdated; else upToDateSection">
                    What's new:
                    <ct-markdown [value]="description"></ct-markdown>

                    <div class="version-info">Current version: Rabix Composer ({{currentVersion}})</div>
                    <div class="version-info">New version: Rabix Composer ({{newVersion}})</div>

                    <div class="dialog-centered">
                        <div class="mt-2">
                            <div>
                                <a #downloadLink href="{{linkForDownload}}"
                                   data-test="update-platform-modal-download-link" 
                                   class="btn btn-primary btn-lg"
                                   (click)="system.openLink(downloadLink.href); modal.close(); false;">Download</a>
                            </div>

                            <div *ngIf="!isIgnoredVersion">
                                <button class="btn-link clickable dismissButton"
                                        data-test="update-platform-modal-dismiss-button"
                                        (click)="skipUpdateVersion()">Skip this version</button>
                            </div>
                        </div>
                    </div>
                </ng-container>

                <ng-template #upToDateSection>
                    <div class="dialog-centered">
                        <div>
                            <div>
                                <button class="btn btn-primary btn-lg"
                                        data-test="update-platform-modal-close-button" 
                                        (click)="modal.close()">Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
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
    currentVersion: string;

    @Input()
    newVersion: string;

    @Input()
    isIgnoredVersion = false;

    @Input()
    linkForDownload: string;

    constructor(public modal: ModalService, public system: SystemService) {
        super();
    }

    skipUpdateVersion() {

    }
}
