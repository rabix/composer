import {
    AfterViewInit, Component, ComponentRef, Input, ViewChild, ViewContainerRef
} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {Observable} from "rxjs/Observable";
import {DynamicNotification} from "./dynamic-notifications/dynamic-notification.interface";

@Component({
    selector: "ct-notification",
    template: `
        <ng-container *ngIf="component; else noComponentView" #componentView>
        </ng-container>

        <ng-template #noComponentView>
            {{message}}
        </ng-template>
    `
})
export class NotificationComponent extends DirectiveBase implements AfterViewInit {

    @Input()
    message: string;

    @Input()
    component: ComponentRef<DynamicNotification>;

    @Input()
    componentInputs: { [key: string]: any } = {};

    @ViewChild("componentView", {read: ViewContainerRef})
    componentView: ViewContainerRef;

    ngAfterViewInit() {

        if (!this.component) {
            return;
        }

        this.component.instance.componentInputs = this.componentInputs;

        Observable.of(1).delay(1).subscribe(() => {
            this.componentView.insert(this.component.hostView);
        });

    }
}
