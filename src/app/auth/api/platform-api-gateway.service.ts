import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {PlatformAPI} from "./platform-api";

@Injectable()
export class PlatformAPIGatewayService {

    private apis: { [hash: string]: PlatformAPI } = {};

    constructor(private http: Http, private prefs: UserPreferencesService) {

        prefs.getCredentials().subscribe(credentials => {
            credentials.forEach(cred => {
                if (this.apis[cred.hash]) {
                    this.apis[cred.hash].setSessionID(cred.sessionID);
                } else {
                    this.apis[cred.hash] = new PlatformAPI(this.http, cred.url, cred.token, cred.sessionID);
                }
            });

            const hashes = credentials.map(c => c.hash);
            for (const hash in this.apis) {
                if (hashes.indexOf(hash) === -1) {
                    delete this.apis[hash];
                }
            }


        });
    }

    forHash(hash: string): PlatformAPI {
        return this.apis[hash];
    }
}
