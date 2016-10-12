import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {UserPreferencesService} from "../storage/user-preferences.service";

export type PlatformSettings = {
    url: string,
    key: string,
    enabled: boolean
}

@Injectable()
export class SettingsService {

    public platformConfiguration = new BehaviorSubject<PlatformSettings>({
        enabled: true,
        key: "",
        url: ""
    });

    constructor(private userPreferencesService: UserPreferencesService) {

        this.platformConfiguration.next(this.userPreferencesService.get("platformConnectionSettings", {
            key: "",
            url: ""
        }));

        this.platformConfiguration.subscribe(settings => {
            this.userPreferencesService.put("platformConnectionSettings", settings);
        });
    }
}
