import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {PlatformAPI} from "./platform-api";

@Injectable()
export class PlatformAPIGatewayService {

    private apis = {};

    constructor(private http: Http, private prefs: UserPreferencesService) {

        prefs.getCredentials().subscribe(credentials => {
            console.log("Got credentials");
            this.apis = credentials.reduce((acc, item) => {
                return {...acc, [item.hash]: new PlatformAPI(this.http, item.url, item.token, item.sessionID)};
            }, {});
        });
    }

    forHash(hash: string): PlatformAPI {
        return this.apis[hash];
    }
}
