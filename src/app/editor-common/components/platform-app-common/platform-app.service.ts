import {Injectable} from "@angular/core";

import "rxjs/add/operator/take";
import {AuthService} from "../../../auth/auth.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {SystemService} from "../../../platform-providers/system.service";

@Injectable()
export class PlatformAppService {

    constructor(private auth: AuthService,
                private errorBar: NotificationBarService,
                private system: SystemService) {
    }

    openOnPlatform(appID: string) {
        this.auth.getActive().take(1).subscribe(credentials => {

            if (!credentials) {
                this.errorBar.showError("Unable to open the app, it seems that you are not connected to any platform.");

                return;
            }

            let platformURL = "https://igor.sbgenomics.com";
            if (credentials.url.indexOf("-api") !== -1) {
                platformURL = credentials.url.replace("-api", "");
            }

            // URL example: u/ivanbatic/test-project/apps/#ivanbatic/test-project/bamtools-index-2-4-0
            const [userSlug, projectSlug, appSlug, revisionID = ""] = appID.split("/");

            const appURL = [
                platformURL,
                "u",
                userSlug,
                projectSlug,
                "apps",
                `#${userSlug}`,
                projectSlug,
                appSlug,
                revisionID
            ].join("/");

            this.system.openLink(appURL);

            return;
        });
    }
}
