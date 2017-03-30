import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/take";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IpcService} from "../ipc.service";
import {CredentialsEntry} from "./user-preferences-types";
import {UserProfileCacheKey} from "./user-profile-cache-key";

@Injectable()
export class UserPreferencesService {

    private updates = new Subject<{
        key: string;
        value: any;
    }>();

    constructor(private ipc: IpcService) {

    }

    public put<T>(key: UserProfileCacheKey, value: T): Observable<T> {

        this.updates.next({key, value});

        if (key.startsWith("dataCache")) {
            return this.ipc.request("putSetting", {key, value});
        }

        window.localStorage.setItem(key, JSON.stringify(value));
        return Observable.of(value);
    }

    public get<T>(key: UserProfileCacheKey, fallback?: T): Observable<T> {


        if (key.startsWith("dataCache")) {

            return this.ipc.request("getSetting", key)

                .merge(this.updates.filter(u => u.key === key).map(u => u.value))
                .map(v => v === undefined ? fallback : v);
        }

        /**
         * Temporary rerouting until we have a better cache system
         * Stuff that are not in dataCache are small and can be stored in localStorage for now
         */

        const hit = window.localStorage.getItem(key);
        let cacheItem;
        if (hit === undefined || hit === null || hit === "undefined" || hit === "null") {
            cacheItem = fallback;
            this.put(key, cacheItem);
        } else {
            try {
                cacheItem = JSON.parse(hit);
            } catch (ex) {
                cacheItem = fallback;
                window.localStorage.setItem(key, cacheItem);
            }
        }

        return Observable.of(cacheItem).merge(this.updates.filter(u => u.key === key).map(u => u.value)).distinctUntilChanged();
    }

    public addAppToRecentList(appID, appType: "Workflow" | "CommandLineTool") {
        this.get("recentApps", []).take(1).map(list => {
            list.unshift(appID);
            return list.filter((e, i, a) => a.indexOf(e) === i).slice(0, 20);
        }).flatMap(list => this.put("recentApps", list));
    }

    patchCredentials(credentials: CredentialsEntry[]) {

        const creds = this.getCredentials();

        creds.take(1).subscribe(oldCredentials => {

            const newCredentials = credentials.map(cred => {
                const oldEntryButSame = oldCredentials.find(e => e.hash === cred.hash);
                if (oldEntryButSame) {
                    return oldEntryButSame;
                }
                return cred;
            });

            this.setCredentials(newCredentials);
        });
    }

    getCredentials(): Observable<CredentialsEntry[]> {
        return this.get("credentials", [] as CredentialsEntry[]);
    }

    setCredentials(credentials) {
        return this.put("credentials", credentials);
    }

    getOpenProjects() {
        return this.get("openProjects", []);
    }

    getOpenFolders() {
        return this.get("localFolders", []);
    }

    getExpandedNodes() {
        return this.get("expandedNodes", []);
    }
}
