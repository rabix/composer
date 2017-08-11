import {Injectable} from "@angular/core";
import {ErrorNotification, NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {ErrorWrapper} from "../helpers/error-wrapper";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {ModalService} from "../../ui/modal/modal.service";
import {UpdatePlatformModalComponent} from "../modals/update-platform-modal/update-platform-modal.component";

@Injectable()
export class GlobalService {

    private checkingForPlatformUpdate = false;

    constructor(private platformRepository: PlatformRepositoryService,
                private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                private modal: ModalService,
                private statusBar: StatusBarService) {
    }

    reloadPlatformData() {

        const process = this.statusBar.startProcess("Syncing platform data. You might not see up-to-date information while sync is in progress.");
        this.platformRepository.fetch().subscribe((data) => {
            this.statusBar.stopProcess(process, "Fetched platform data");

        }, err => {
            console.log("Error", err);
            this.notificationBar.showNotification(new ErrorNotification("Cannot sync platform data. " + new ErrorWrapper(err)));
            this.statusBar.stopProcess(process, "Failed to fetch platform data.");
        });
    }

    checkForPlatformUpdates() {

        if (!this.checkingForPlatformUpdate) {

            this.checkingForPlatformUpdate = true;

            const process = this.statusBar.startProcess("Checking for platform updates.");

            this.platformRepository.checkForPlatformUpdates().withLatestFrom(this.localRepository.getUpdateAvailable())
                .take(1).subscribe((result) => {

                this.checkingForPlatformUpdate = false;
                this.statusBar.stopProcess(process, "Checking for platform updates is finished.");

                const [hasUpdate, lastAvailableUpdateStored] = result;

                if (!hasUpdate) {
                    this.localRepository.setUpdateAvailable(null).then();
                    return;
                }

                if (hasUpdate !== lastAvailableUpdateStored) {
                    const modal = this.modal.fromComponent(UpdatePlatformModalComponent, { title: "Update available!"});

                    modal.description = hasUpdate.body;
                    modal.downloadLink = hasUpdate.html_url;

                    modal.onCancel = () => {
                        this.modal.close();
                        this.localRepository.setUpdateAvailable(hasUpdate).then();
                    };
                }

            }, (err) => {
                this.checkingForPlatformUpdate = false;
                this.statusBar.stopProcess(process, "Failed to get platform updates.");
                this.notificationBar.showNotification(new ErrorNotification("Cannot get platform updates. " + new ErrorWrapper(err)));
            });
        }
    }
}
