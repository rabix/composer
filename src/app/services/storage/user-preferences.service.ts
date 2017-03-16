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

    public put(key: UserProfileCacheKey, value: any): void {

        this.ipc.request("putSetting", {key, value});
        this.updates.next({key, value});
    }

    public get<T>(key: UserProfileCacheKey, fallback?: T): Observable<T> {

        console.log("Requesting", key);
        return this.ipc.request("getSetting", key)

            .merge(this.updates.filter(u => u.key === key).map(u => u.value))
            .map(v => v === undefined ? fallback : v);
    }
}
