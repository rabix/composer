import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs";
import {UserPreferencesService} from "../storage/user-preferences.service";

export type PlatformSettings = {
    url: string,
    key: string,
    enabled: boolean
}

@Injectable()
export class SettingsService {

    public platformConfiguration = new ReplaySubject<PlatformSettings>(1);

    public validity = new ReplaySubject<boolean>(1);

    constructor(private userPreferencesService: UserPreferencesService) {

        const prefs = this.userPreferencesService.get("platformConnectionSettings", false);
        if (prefs) {
            this.platformConfiguration.next(prefs);
        } else {
            this.validity.next(false);
        }

        this.platformConfiguration.subscribe(settings => {
            this.userPreferencesService.put("platformConnectionSettings", settings);
            this.validity.next(true);
        });
    }
}
