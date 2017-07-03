import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";

@Injectable()
export class NotificationBarService {

    public message = new ReplaySubject<string>();

    public showError(message: string) {
        this.message.next(message);
    }
}
