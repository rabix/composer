import {Injectable} from "@angular/core";
import {NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {ErrorWrapper} from "../helpers/error-wrapper";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {ModalService} from "../../ui/modal/modal.service";
import {UpdatePlatformModalComponent} from "../modals/update-platform-modal/update-platform-modal.component";
import {IpcService} from "../../services/ipc.service";
import {GitHubRelease} from "../../../../electron/src/github-api-client/interfaces/github-release";
import {noop} from "../../lib/utils.lib";
import {AboutPageModalComponent} from "../modals/about-page-modal/about-page-modal.component";
import {withLatestFrom, take} from "rxjs/operators";

@Injectable()
export class GlobalService {

    private checkForPlatformUpdatePromise: Promise<any> = null;

    platformIsOutdated = false;

    private showModal = false;

    constructor(private platformRepository: PlatformRepositoryService,
                private localRepository: LocalRepositoryService,
                private notificationBar: NotificationBarService,
                private ipc: IpcService,
                private modal: ModalService,
                private statusBar: StatusBarService) {
    }

    reloadPlatformData() {

        const process = this.statusBar.startProcess("Syncing Platform data. You might not see up-to-date information while sync is in progress.");
        this.platformRepository.fetch().subscribe((data) => {
            this.statusBar.stopProcess(process, "Fetched Platform data");

        }, err => {
            this.notificationBar.showNotification("Cannot sync with the Platform.  " + new ErrorWrapper(err));
            this.statusBar.stopProcess(process, "Failed to fetch Platform data.");
        });
    }

    checkForPlatformUpdates(showModal: boolean = false): Promise<GitHubRelease> {

        // In the case when first checkForPlatformUpdates is called (main component) and while this is not resolved yet
        // user clicks to manually trigger checkForPlatformUpdates
        this.showModal = showModal;

        if (this.checkForPlatformUpdatePromise) {
            return this.checkForPlatformUpdatePromise;
        }

        this.checkForPlatformUpdatePromise = new Promise((resolve, reject) => {

            const process = this.statusBar.startProcess("Checking for Platform updates...");

            this.ipc.request("checkForPlatformUpdates").pipe(
                withLatestFrom(this.localRepository.getIgnoredUpdateVersion()),
                take(1)
            ).subscribe((result: [GitHubRelease, string]) => {

                this.checkForPlatformUpdatePromise = null;
                this.statusBar.stopProcess(process, "");

                const [hasUpdate, ignoredUpdateVersion] = result;

                if (hasUpdate) {

                    this.platformIsOutdated = true;
                    const isIgnoredVersion = hasUpdate.tag_name === ignoredUpdateVersion;

                    if (!isIgnoredVersion || showModal) {
                        const modal = this.modal.fromComponent(UpdatePlatformModalComponent, "Update");

                        modal.platformIsOutdated = true;
                        modal.description = hasUpdate.body;
                        modal.newVersion = hasUpdate.tag_name;
                        modal.currentVersion = window["require"]("electron").remote.app.getVersion();
                        modal.isIgnoredVersion = isIgnoredVersion;
                        modal.linkForDownload = hasUpdate.html_url;

                        modal.skipUpdateVersion = () => {
                            this.modal.close();
                            this.localRepository.setIgnoredUpdateVersion(hasUpdate.tag_name);
                        };
                    }

                } else {

                    this.localRepository.setIgnoredUpdateVersion(null).then();

                    if (this.showModal) {
                        this.modal.fromComponent(UpdatePlatformModalComponent, "Update");
                    }
                }

                resolve(result);

            }, (err) => {
                this.checkForPlatformUpdatePromise = null;
                this.statusBar.stopProcess(process, "");

                if (this.showModal) {
                    this.modal.error({title: "Update",
                        content: "An error occurred while checking for update information."}).catch(noop);
                }

                reject(err);
            });
        });

        return this.checkForPlatformUpdatePromise;
    }

    showAboutPageModal() {
        this.modal.fromComponent(AboutPageModalComponent, "About");
    }
}
