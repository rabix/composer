import {Component, ComponentRef, Injectable, ComponentFactoryResolver, Type, ReflectiveInjector} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {race} from "rxjs/observable/race";
import {of} from "rxjs/observable/of";
import {delay, take, filter, flatMap} from "rxjs/operators";
import {never} from "rxjs/observable/never";

export type NotificationContent = string | Type<Component>;
export type NotificationType = "success" | "info" | "error" | "warning";

export interface NotificationOptions {
    type?: NotificationType;
    timeout?: number;
}

export interface Notification {
    type: NotificationType;
    timeout: number;
    message?: string;
    component?: ComponentRef<Component>;
}

@Injectable()
export class NotificationBarService {

    static maxDisplay = 3;

    static defaultNotificationType: NotificationType = "error";

    static defaultNotificationTimeout = Infinity;

    /** Array of notifications */
    private notifications: Array<Notification> = [];

    private showNotificationStream = new Subject<Notification>();

    private dismissNotificationStream = new Subject<Notification>();

    /** Stream of displayed notifications */
    displayedNotifications = new Subject<any>();

    constructor(private resolver: ComponentFactoryResolver) {

        this.showNotificationStream.pipe(
            flatMap((notification) => {

                // Dismiss notification when delay time passed or when its manually dismissed
                return race(
                    of(notification).pipe(
                        flatMap(notification => {
                            if (notification.timeout === Infinity) {
                                return never();
                            }
                            return of(notification).pipe(delay(notification.timeout));
                        })
                    ),
                    this.dismissNotificationStream.pipe(
                        filter((n) => n === notification),
                        take(1)
                    )
                );
            })
        ).subscribe((notification: Notification) => {
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
        const maxDisplayLength    = NotificationBarService.maxDisplay;

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
            timeout: options.timeout || NotificationBarService.defaultNotificationTimeout
        };

        if (typeof notificationContent === "string") {
            notification.message = notificationContent;
            return notification;
        }

        const factory = this.resolver.resolveComponentFactory(notificationContent);

        notification.component = factory.create(ReflectiveInjector.fromResolvedProviders(ReflectiveInjector.resolve([])));

        return notification;
    }

    showNotification(notificationContent: NotificationContent, options?: NotificationOptions) {

        const notification = this.createNotification(notificationContent, options);

        const similarExists = this.notifications.find((n) => n.message === notification.message);
        //
        if (!similarExists) {
            //
            this.notifications.push(notification);
            if (this.notifications.length <= NotificationBarService.maxDisplay) {
                // Display updated list with added notification
                this.showNext(true);
            }
        }
    }

    showDynamicNotification<T>(notificationContent: { new(...argv: any[]): T }, options?: NotificationOptions): T {

        const notification = this.createNotification(notificationContent, options);

        const similarExists = this.notifications.find((n) => n === notification);

        if (!similarExists) {

            this.notifications.push(notification);
            if (this.notifications.length <= NotificationBarService.maxDisplay) {
                // Display updated list with added notification
                this.showNext(true);
            }
        }

        return notification.component.instance as T;
    }

    dismissNotification(notification: Notification) {
        this.dismissNotificationStream.next(notification);
    }

    dismissDynamicNotification<T>(component: T) {
        const notification = this.notifications.find((notification) => notification.component.instance === component);
        this.dismissNotification(notification);
    }
}
