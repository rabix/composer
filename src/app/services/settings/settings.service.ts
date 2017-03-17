import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {UserPreferencesService} from "../storage/user-preferences.service";

export type PlatformSettings = {
    url: string,
    key: string,
    enabled: boolean
};

@Injectable()
export class SettingsService {

    public platformConfiguration = new ReplaySubject<PlatformSettings>(1);

    public validity = new ReplaySubject<boolean>(1);

    constructor(private profile: UserPreferencesService) {
        // this.profile.get<PlatformSettings | boolean>("platformConnectionSettings", false)
        //     .subscribe(prefs => {
        //         if (prefs === false) {
        //             return this.validity.next(false);
        //         }
        //         this.platformConfiguration.next(prefs as PlatformSettings);
        //     });
        //
        // this.platformConfiguration.subscribe(settings => {
        //     this.profile.put("platformConnectionSettings", settings);
        //     this.validity.next(true);
        // });
    }
}
