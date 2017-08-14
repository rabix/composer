import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

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

    /** Array of notifications */
    private notifications: Array<Notification> = [];

    private showNotificationStream = new Subject<Notification>();

    private dismissNotificationStream = new Subject<Notification>();

    /** Stream of displayed notifications */
    public displayedNotifications = new Subject<any>();

    constructor() {
        this.showNotificationStream.flatMap((notification) => {

            // Dismiss notification when delay time passed or when its manually dismissed
            return Observable.race(Observable.of(notification).delay(notification.duration)
                , this.dismissNotificationStream.filter((n) => n === notification).take(1));

        }).subscribe((notification) => {
            this.dismiss(notification);
        });
    }

    /** Dismiss notification passed as an argument */
    private dismiss(notification: Notification) {
        const index = this.notifications.findIndex((n) => n === notification);

        if (index !== -1) {
            // Remove notification from the list
            this.notifications.splice(index, 1);

            if (index >= 0 && index <= NotificationBarService.maxDisplay) {
                // Display updated list with next pending notification (if exists)
                this.showNext();
            }
        }
    }

    /** Show next pending notification
     * @param {boolean} added - true/false if last operation was addition/deletion
     */
    private showNext(added: boolean = false) {

        const notificationsLength = this.notifications.length;
        const maxDisplayLength = NotificationBarService.maxDisplay;

        if (added && notificationsLength <= maxDisplayLength) {
            // If last operation was addition we should display the added notification if length <= maxDisplay
            this.showNotificationStream.next(this.notifications[notificationsLength - 1]);
        } else if (!added && notificationsLength >= maxDisplayLength) {
            // If last operation was deletion we should display the next pending notification if exists
            this.showNotificationStream.next(this.notifications[maxDisplayLength - 1]);
        }

        // Updated list of displayed notifications
        this.displayedNotifications.next(this.notifications.slice(0, maxDisplayLength));
    }

    public showNotification(notification: Notification) {
        const similarExists = this.notifications.find((n) => n.message === notification.message);

        if (!similarExists) {

            this.notifications.push(notification);
            if (this.notifications.length <= NotificationBarService.maxDisplay) {
                // Display updated list with added notification
                this.showNext(true);
            }
        }
    }

    public dismissNotification(notification: Notification) {
        this.dismissNotificationStream.next(notification);
    }
}
