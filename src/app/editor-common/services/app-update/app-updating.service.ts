import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";

@Injectable()
export class AppUpdateService {

    update = new Subject<any>();

    constructor() {
    }

    updateApps(data: any) {
        this.update.next(data);
    }
}
