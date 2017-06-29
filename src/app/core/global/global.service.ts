import {Injectable} from "@angular/core";
import {NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";

@Injectable()
export class GlobalService {

    constructor(private platformRepository: PlatformRepositoryService,
                private notification: NotificationBarService,
                private statusBar: StatusBarService) {
    }

    reloadPlatformData() {
        const process = this.statusBar.startProcess("Syncing platform data. You might not see up-to-date information while sync is in progress.");
        this.platformRepository.fetch().subscribe((data) => {
            this.statusBar.stopProcess(process, "Fetched platform data");

        }, (err: Error) => {
            this.notification.showError("Cannot sync platform data. " + err["error"] ? err["error"]["message"] : err.message);
            this.statusBar.stopProcess(process, "Failed to fetch platform data.");
        });
    }
}
