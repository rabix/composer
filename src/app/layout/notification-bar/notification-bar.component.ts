import {Component, Input} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {NotificationBarService} from "./notification-bar.service";

@Component({
    selector: "ct-notification-bar",
    styleUrls: ["./notification-bar.component.scss"],
    template: `
        <div class="error-alert pl-1" [class.show]="show">
            <i class="fa fa-minus-circle"></i>

            <div class="error-text pr-1">
                {{error}}
            </div>

            <i class="fa fa-times clickable" (click)="close()"></i>
        </div>
    `
})
export class NotificationBarComponent extends DirectiveBase {

    @Input()
    public autoClose = false;

    @Input()
    public fadeOutTime = 3000;

    public show = false;

    public error: string;

    constructor(public errorBarService: NotificationBarService) {
        super();
        this.tracked = this.errorBarService.message.do((message) => {
            this.error = message;
            this.open();
        }).debounceTime(this.fadeOutTime).subscribe(() => {
            if (this.autoClose) {
                this.close();
            }
        });
    }

    public open() {
        this.show = true;
    }

    public close() {
        this.show = false;
    }
}
