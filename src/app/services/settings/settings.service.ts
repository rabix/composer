import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {UserPreferencesService} from "../storage/user-preferences.service";

@Injectable()
export class SettingsService {

    public platformConfiguration = new ReplaySubject<{
        url: string;
        token: string;
    }>(1);

    public validity = new ReplaySubject<boolean>(1);

    constructor(private profile: UserPreferencesService) {

        this.profile.get("credentials", []).map(prefs => prefs[0]).subscribe(prefs => {
            if (!prefs || !prefs.url || !prefs.token) {
                return this.validity.next(false);
            }
            this.platformConfiguration.next(prefs);
        });

        // this.platformConfiguration.subscribe(settings => {
        //     this.profile.put("platformConnectionSettings", settings);
        //     this.validity.next(true);
        // });
    }
}
