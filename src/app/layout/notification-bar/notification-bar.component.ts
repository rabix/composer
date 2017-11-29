import {ChangeDetectorRef, Component} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {Notification, NotificationBarService} from "./notification-bar.service";

@Component({
    selector: "ct-notification-bar",
    styleUrls: ["./notification-bar.component.scss"],
    template: `
        <div *ngFor="let notification of notifications;"
             class="notification pl-1 notification-{{notification.type}}"
             data-test="notification-bar">
            <i class="fa"
               [class.fa-check]="notification.type === 'success'"
               [class.fa-info-circle]="notification.type === 'info'"
               [class.fa-minus-circle]="notification.type === 'error'"
               [class.fa-exclamation-triangle]="notification.type === 'warning'">
            </i>

            <div class="error-text pl-2 pr-1">
                <ct-notification
                    [message]="notification.message"
                    [component]="notification.component">
                </ct-notification>
            </div>

            <i class="fa fa-times pr-1 clickable" (click)="close(notification)"></i>
        </div>

    `
})
export class NotificationBarComponent extends DirectiveBase {

    public notifications: Notification [];

    constructor(public notificationBarService: NotificationBarService, public cdr: ChangeDetectorRef) {
        super();
        this.notificationBarService.displayedNotifications.distinctUntilChanged()
            .subscribeTracked(this, (notifications) => {
             this.notifications = notifications;
        });
    }

    public close(notification: Notification) {
        this.notificationBarService.dismissNotification(notification);
    }
}
