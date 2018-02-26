import {AfterViewInit, Component, ComponentRef, Input, ViewChild, ViewContainerRef} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {of} from "rxjs/observable/of";
import {delay} from "rxjs/operators";

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
    component: ComponentRef<Component>;

    @ViewChild("componentView", {read: ViewContainerRef})
    componentView: ViewContainerRef;

    ngAfterViewInit() {

        if (!this.component) {
            return;
        }

        of(1).pipe(
            delay(1)
        ).subscribeTracked(this, () => {
            this.componentView.insert(this.component.hostView);
        });

    }
}
