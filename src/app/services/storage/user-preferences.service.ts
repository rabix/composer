import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/take";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {IpcService} from "../ipc.service";
import {UserProfileCacheKey} from "./user-profile-cache-key";

@Injectable()
export class UserPreferencesService {

    private updates = new Subject<{
        key: string;
        value: any;
    }>();

    constructor(private ipc: IpcService) {

    }

    public put(key: UserProfileCacheKey, value: any) {

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
            cacheItem = JSON.parse(hit);
        }

        return Observable.of(cacheItem).merge(this.updates.filter(u => u.key === key).map(u => u.value)).distinctUntilChanged();
    }

    public addAppToRecentList(appID, appType: "Workflow" | "CommandLineTool") {
        this.get("recentApps", []).take(1).map(list => {
            list.unshift(appID);
            return list.filter((e, i, a) => a.indexOf(e) === i).slice(0, 20);
        }).flatMap(list => this.put("recentApps", list));
    }
}
