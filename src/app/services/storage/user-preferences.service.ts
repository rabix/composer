import {Injectable} from "@angular/core";
import {Observable} from "rxjs";


@Injectable()
export class UserPreferencesService {

    private storage: Storage;

    constructor() {
        this.storage = localStorage;
    }

    public put(key: string, value: any): void {
        this.storage.setItem(key, JSON.stringify(value));
    }

    public get<T>(key: string, fallback?: T, saveDefault = false): Observable<T> {

        const val = this.storage.getItem(key);

        if (!val && typeof val !== "number") {
            if (saveDefault) {
                this.put(key, fallback);
            }
            return Observable.of(fallback);
        }

        if (val === "undefined") {
            this.storage.removeItem(key);
            return Observable.of(fallback);
        }

        return Observable.of(JSON.parse(val));
    }
}
