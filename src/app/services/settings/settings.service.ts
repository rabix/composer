import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs";
import {UserPreferencesService} from "../storage/user-preferences.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

export type PlatformSettings = {
    url: string,
    key: string,
    enabled: boolean
};

@Injectable()
export class SettingsService extends DirectiveBase {

    public platformConfiguration = new ReplaySubject<PlatformSettings>(1);

    public validity = new ReplaySubject<boolean>(1);

    constructor(private userPreferencesService: UserPreferencesService) {
        super();

        this.tracked = this.userPreferencesService.get<PlatformSettings | boolean>("platformConnectionSettings", false)
            .subscribe(prefs => {
                if (prefs === false) {
                    return this.validity.next(false);
                }
                this.platformConfiguration.next(prefs as PlatformSettings);
            });

        this.platformConfiguration.subscribe(settings => {
            this.userPreferencesService.put("platformConnectionSettings", settings);
            this.validity.next(true);
        });
    }
}
