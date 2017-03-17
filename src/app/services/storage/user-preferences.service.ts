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
        return this.ipc.request("putSetting", {key, value});
    }

    public get<T>(key: UserProfileCacheKey, fallback?: T): Observable<T> {

        return this.ipc.request("getSetting", key)

            .merge(this.updates.filter(u => u.key === key).map(u => u.value))
            .map(v => v === undefined ? fallback : v);
    }
}
