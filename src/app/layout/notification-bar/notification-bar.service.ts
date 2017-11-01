import {Component, ComponentRef, Injectable, ComponentFactoryResolver, Type, ReflectiveInjector} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

export type NotificationContent = string | Type<Component>;
export type NotificationType = "info" | "error" | "warning";

export interface NotificationOptions {
    type?: NotificationType;
    timeout?: number;
    testAttr?: string;
}

export interface Notification {
    type: NotificationType;
    timeout: number;
    message?: string;
    component?: ComponentRef<Component>;
    testAttr?: string;
}

@Injectable()
export class NotificationBarService {

    public static maxDisplay = 3;

    public static defaultNotificationType: NotificationType = "error";

    public static defaultNotificationTimeout = Infinity;

    /** Array of notifications */
    private notifications: Array<Notification> = [];

    private showNotificationStream = new Subject<Notification>();

    private dismissNotificationStream = new Subject<Notification>();

    /** Stream of displayed notifications */
    public displayedNotifications = new Subject<any>();

    constructor(private resolver: ComponentFactoryResolver) {
        this.showNotificationStream.flatMap((notification) => {

            // Dismiss notification when delay time passed or when its manually dismissed
            return Observable.race(Observable.of(notification).delay(notification.timeout)
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

    private createNotification(notificationContent: NotificationContent, options: NotificationOptions = {} as NotificationOptions) {

        const notification: Notification = {
            type: options.type || NotificationBarService.defaultNotificationType,
            timeout: options.timeout || NotificationBarService.defaultNotificationTimeout,
            testAttr: options.testAttr || ""
        };

        if (typeof notificationContent === "string") {
            notification.message = notificationContent;
            return notification;
        }

        const factory = this.resolver.resolveComponentFactory(notificationContent);

        notification.component = factory.create(ReflectiveInjector.fromResolvedProviders(ReflectiveInjector.resolve([])));

        return notification;
    }

    public showNotification(notificationContent: NotificationContent, options?: NotificationOptions) {

        const notification = this.createNotification(notificationContent, options);

        const similarExists = this.notifications.find((n) => n.message === notification.message);

        if (!similarExists) {

            this.notifications.push(notification);
            if (this.notifications.length <= NotificationBarService.maxDisplay) {
                // Display updated list with added notification
                this.showNext(true);
            }
        }
    }

    public showDynamicNotification<T>(notificationContent: { new(...argv: any[]): T }, options?: NotificationOptions): T {

        const notification = this.createNotification(notificationContent, options);

        const similarExists =  this.notifications.find((n) => n === notification);

        if (!similarExists) {

            this.notifications.push(notification);
            if (this.notifications.length <= NotificationBarService.maxDisplay) {
                // Display updated list with added notification
                this.showNext(true);
            }
        }

        return notification.component.instance as T;
    }

    public dismissNotification(notification: Notification) {
        this.dismissNotificationStream.next(notification);
    }

    public dismissDynamicNotification<T>(component: T) {
        const notification = this.notifications
            .find((notification) => notification.component.instance === component);
        this.dismissNotification(notification);
    }
}
