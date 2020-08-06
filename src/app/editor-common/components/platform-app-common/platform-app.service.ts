import {Injectable} from "@angular/core";

import {AuthService} from "../../../auth/auth.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {SystemService} from "../../../platform-providers/system.service";
import {take} from "rxjs/operators";
import {AuthCredentials} from "../../../auth/model/auth-credentials";

@Injectable()
export class PlatformAppService {

    constructor(private auth: AuthService,
                private notificationBar: NotificationBarService,
                private system: SystemService) {
    }

    openOnPlatform(appID: string) {
        this.auth.getActive().pipe(
            take(1)
        ).subscribe(credentials => {

            if (!credentials) {
                this.notificationBar.showNotification(`Unable to open ${appID}, it seems that you are not connected to any platform.`);

                return;
            }

            // Remove port from url
            let platformAPIURL = credentials.url.replace(/.com:[1-9]+/, ".com");

            let platformURL = (!~platformAPIURL.indexOf("-vayu"))
                ? AuthCredentials.platformLookupByAPIURL[platformAPIURL].platformURL : platformAPIURL;

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
