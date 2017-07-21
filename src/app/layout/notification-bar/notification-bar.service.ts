import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class Notification {
    message: string;
    type: "error" | "warning" | "info" | string;
    duration: number;

    dismiss = new Subject<any>();

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

    /** Max number of displayed notifications */
    public static maxDisplay = 5;

    /** Queue of notifications waiting to be displayed */
    private pendingNotifications = [];

    /**  Notifications that are currently displayed */
    public displayedNotifications = new BehaviorSubject<any>([]);

    private notificationsStream = new Subject<any>();

    private updates = new Subject<any>();

    private aggregate = this.updates.scan((acc, patch) => patch(acc), []).do((agg) => {
        this.displayedNotifications.next(agg);
    });

    /**  Flag to limit number of values in queue (zip operator) for availability stream to 1  */
    private available = false;

    private availabilityStream = Observable.of(true).merge(this.aggregate.map(agg => agg.length < NotificationBarService.maxDisplay))
        .filter((v) => {

            // Limit number of values in queue (zip operator) for availability stream to 1
            // In case for example when maxDisplay is 3 and you have 3 displayed and 0 pending notifications.
            // Once one notification is dismissed you will have one value in zip operator queue (availability stream)
            // When you dismiss them all you will have 3 values in the queue. Now add 1 notification, you will have
            // 4 values in the queue and so on. Using this variable only one value can be in the queue
            if (!v || this.available) {
                return false;
            }
            return this.available = true;
        });

    constructor() {
        Observable.zip(this.notificationsStream, this.availabilityStream, msg => msg)
            .flatMap(msg => {

                this.available = false;
                this.pendingNotifications.shift();

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
                        }).delayWhen(() =>
                            // Dismiss notification when delay time passed or when its manually dismissed
                            Observable.merge(Observable.of(1).delay(msg.duration), msg.dismiss))
                    );
            })
            .subscribe(patches => {
                this.updates.next(patches);
            });
    }

    public showNotification(notification: Notification) {
        // If notification is not in queue of pending notifications or its already displayed
        if (!this.pendingNotifications.concat(this.displayedNotifications.getValue())
                .find((item) => notification.message === item.message)) {

            this.pendingNotifications.push(notification);
            this.notificationsStream.next(notification);
        }
    }

    public dismissNotification(notification: Notification) {
        if (this.displayedNotifications.getValue().find((displayed) => displayed === notification)) {
            notification.dismiss.next();
        }
    }
}
