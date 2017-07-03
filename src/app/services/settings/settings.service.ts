import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";

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
}
