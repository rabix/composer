import {EventEmitter, Injectable} from "@angular/core";

@Injectable()
export class AppUpdateService {

    update = new EventEmitter<any>();

    constructor() {
    }

    notifySubscribers(data: any) {
        this.update.next(data);
    }
}
