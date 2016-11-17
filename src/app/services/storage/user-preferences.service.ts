import {Injectable} from "@angular/core";


@Injectable()
export class UserPreferencesService {

    private storage: Storage;

    constructor() {
        this.storage = localStorage;
    }

    public put(key: string, value: any): void {
        this.storage.setItem(key, JSON.stringify(value));
    }

    public get<T>(key: string, fallback?: T, saveDefault = false): T {

        const val = this.storage.getItem(key);

        if (!val && typeof val !== "number") {
            if (saveDefault) {
                this.put(key, fallback);
            }
            return fallback;
        }

        if (val === "undefined") {
            this.storage.removeItem(key);
            return fallback;
        }

        return JSON.parse(val);
    }
}