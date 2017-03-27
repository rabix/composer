import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {AuthService} from "../auth/auth.service";
import {PlatformAPI} from "./platform-api";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

@Injectable()
export class PlatformAPIGatewayService {

    private connectionServices = new BehaviorSubject({});
    private apis               = {};

    constructor(private http: Http, private auth: AuthService, private prefs: UserPreferencesService) {

        prefs.getCredentials().subscribe(credentials => {
            console.log("Got credentials");
            this.apis = credentials.reduce((acc, item) => {
                return {...acc, [item.hash]: new PlatformAPI(this.http, item.url, item.token, item.sessionID)};
            }, {});
        });

        // auth.connections.withLatestFrom(this.connectionServices, (creds, conns) => ({creds, conns}))
        //     .subscribe(data => {
        //         const {creds, conns} = data;
        //
        //         const hashes = creds.map(c => c.hash);
        //         for (const hash in conns) {
        //             if (hashes.indexOf(hash) === -1) {
        //                 delete conns[hash];
        //             }
        //         }
        //
        //         creds.forEach(cred => {
        //             if (!conns[cred.hash] || conns[cred.hash].sessionID !== cred.sessionID) {
        //                 conns[cred.hash] = new PlatformAPI(this.http, cred.url, cred.token, cred.sessionID);
        //             }
        //         });
        //
        //         this.connectionServices.next(conns);
        //     });
    }

    forHash(hash: string): PlatformAPI {
        console.log("Asking for an api", hash, this.apis);
        return this.apis[hash];
    }

    proxy(hash: string): Observable<PlatformAPI> {
        return this.connectionServices.map(services => {
            if (services[hash]) {
                return services[hash];
            }

            console.warn("This shouldn't have happened, but it obviously did, so handle it");
            return undefined;
        }).filter(a => a).distinctUntilChanged((a, b) => {
            console.log("Checking for equality of", a, b);
            return a === b;
        }).do(_ => console.log("Received a new API for", hash));
    }

}
