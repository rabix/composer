import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

export class Notification {
    message: string;
    type: "error" | "warning" | "info" | string;
    duration: number;

    constructor(message: string, type, duration: number = Infinity) {
        this.message = message;
        this.type = type;
        this.duration = duration;
    }
}

export class InfoNotification extends Notification {
    constructor(message: string, duration?: number) {
        super(message, "info", duration);
    }
}

export class WarningNotification extends Notification {
    constructor(message: string, duration?: number) {
        super(message, "warning", duration);
    }
}

export class ErrorNotification extends Notification {
    constructor(message: string, duration?: number) {
        super(message, "error", duration);
    }
}


@Injectable()
export class NotificationBarService {

    public static maxDisplay = 3;

    private notifications = new Subject<any>();

    private updates = new Subject<any>();

    public aggregate = this.updates.scan((acc, patch) => patch(acc), []);

    private availability = Observable.of([]).merge(this.aggregate.map(agg => agg.length < NotificationBarService.maxDisplay).filter(v => v));

    constructor() {
        Observable.zip(this.notifications, this.availability, msg => msg).map((msg) => msg.notification)
            .flatMap(msg => {

                // Take the message and create an observable of 2 emits.
                // They are update transformations for the list of shown messages
                // First one appends the message to the list
                // The second one is delayed for {notificationLifetime} time, and then emits a transformation that
                // removes the message from the list
                // Both of these emits will trigger reevaluation of the available space in the list
                return Observable.of(acc => acc.concat(msg))
                    .concat(
                        Observable.of(acc => {
                            const idx = acc.indexOf(msg);
                            if (idx === -1) {
                                return acc;
                            }

                            return acc.slice(0, idx).concat(acc.slice(idx + 1));
                        }).delay(msg.duration)
                    );
            })
            .subscribe(patches => {
                this.updates.next(patches);
            });

    }


    public showNotification(notification: Notification) {
        this.notifications.next({
            notification
        });
    }

    public dismissNotification(notification: Notification) {
        this.updates.next((all: Notification[]) => {
            return all.filter(n => n !== notification);
        });
    }
}
