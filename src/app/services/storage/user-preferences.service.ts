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

    public get(key: string, fallback = undefined): any {
        const val = this.storage.getItem(key);

        if (!val && typeof val !== "number") {
            return fallback;
        }

        return JSON.parse(val);
    }
}