import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {UserPreferencesService} from "../storage/user-preferences.service";

@Injectable()
export class SettingsService {

    public platformConfiguration = new ReplaySubject<{
        profile: string,
        url: string;
        token: string;
    }>(1);

    public userInfo = new ReplaySubject<{
        email: string,
        id: string,
        staff: boolean,
        username: string
    }>(1);

    public validity = new ReplaySubject<boolean>(1);

    /**
     * @deprecated Use PlatformConnectionService.urlToProfile
     */
    static urlToProfile(url) {
        const profile = url.match("https:\/\/(.*?)\.sbgenomics\.com")[1].toLowerCase();
        return profile === "igor" ? "default" : profile;
    }

    constructor(private profile: UserPreferencesService) {

        // this.profile.get("credentials", [
        //     {
        //         label: "Seven Bridges",
        //         profile: "default",
        //         url: "https://igor.sbgenomics.com",
        //         sessionID: null,
        //         token: "",
        //     }
        // ])
        //     .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
        //     .map(prefs => prefs[0])
        //     .subscribe(prefs => {
        //
        //         if (!prefs || !prefs.url || !prefs.token) {
        //             return this.validity.next(false);
        //         }
        //
        //         this.platformConfiguration.next(prefs);
        //     });

    }
}
