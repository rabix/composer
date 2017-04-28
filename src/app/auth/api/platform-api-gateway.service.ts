import {Injectable} from "@angular/core";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {PlatformAPI} from "./platform-api";
import {CtHttp} from "../../http/ct-http.service";

@Injectable()
export class PlatformAPIGatewayService {

    private apis: { [hash: string]: PlatformAPI } = {};


    constructor(private http: CtHttp, private prefs: UserPreferencesService) {

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

    addBeforeInterceptor(callback: Function) {
        this.http.addBeforeInterceptor(callback);
    }

    removeBeforeInterceptor(callback: Function) {
        this.http.removeBeforeInterceptor(callback);
    }

    addAfterInterceptor(callback: Function) {
        this.http.addAfterInterceptor(callback);
    }

    removeAfterInterceptor(callback: Function) {
        this.http.removeAfterInterceptor(callback);
    }

    addErrorInterceptor(callback: Function) {
        this.http.addErrorInterceptor(callback);
    }

    removeErrorInterceptor(callback: Function) {
        this.http.removeErrorInterceptor(callback);
    }
}
