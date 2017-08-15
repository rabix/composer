import {Injectable} from "@angular/core";
import {ErrorNotification, NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {ErrorWrapper} from "../helpers/error-wrapper";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {ModalService} from "../../ui/modal/modal.service";
import {UpdatePlatformModalComponent} from "../modals/update-platform-modal/update-platform-modal.component";
import {IpcService} from "../../services/ipc.service";

@Injectable()
export class GlobalService {

    private checkForPlatformUpdatePromise: Promise<any> = null;

    public platformIsOutdated = false;

    constructor(private platformRepository: PlatformRepositoryService,
                private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                private ipc: IpcService,
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

    checkForPlatformUpdates(showUpToDateModal: boolean = false) {

        if (this.checkForPlatformUpdatePromise) {
            return this.checkForPlatformUpdatePromise;
        }

        this.checkForPlatformUpdatePromise = new Promise((resolve, reject) => {

            const process = this.statusBar.startProcess("Checking for platform updates...");

            this.ipc.request("checkForPlatformUpdates").withLatestFrom(this.localRepository.getIgnoredUpdateVersion())
                .take(1).subscribe((result) => {

                this.checkForPlatformUpdatePromise = null;
                this.statusBar.stopProcess(process, "");

                const [hasUpdate, ignoredUpdateVersion] = result;

                if (hasUpdate) {

                    this.platformIsOutdated = true;

                    if (hasUpdate !== ignoredUpdateVersion) {
                        const modal = this.modal.fromComponent(UpdatePlatformModalComponent, {title: "Platform updates!"});

                        modal.platformIsOutdated = true;
                        modal.description = hasUpdate.body;
                        modal.downloadLink = hasUpdate.html_url;

                        modal.onCancel = () => {
                            this.modal.close();
                            this.localRepository.setIgnoredUpdateVersion(hasUpdate);
                        };
                    }

                } else {

                    this.localRepository.setIgnoredUpdateVersion(null).then();

                    if (showUpToDateModal) {
                        const modal = this.modal.fromComponent(UpdatePlatformModalComponent, {title: "Platform updates!"});

                        modal.onCancel = () => {
                            this.modal.close();
                        };
                    }
                }

                resolve(result);

            }, (err) => {
                this.checkForPlatformUpdatePromise = null;
                this.statusBar.stopProcess(process, "");
                this.notificationBar.showNotification(new ErrorNotification("Cannot get platform updates. " + new ErrorWrapper(err)));

                reject(err);
            });
        });

        return this.checkForPlatformUpdatePromise;
    }
}
