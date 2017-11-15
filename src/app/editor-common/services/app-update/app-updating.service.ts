import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class AppUpdateService {

    update = new EventEmitter<any>();

    constructor() {
    }

    updateApps(data: any) {
        this.update.next(data);
    }
}
