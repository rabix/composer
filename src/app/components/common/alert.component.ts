import {ChangeDetectionStrategy, Component, HostBinding, Input, ViewEncapsulation} from "@angular/core";
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-alert",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        "class": "form-control-label",
    },
    template: `
        <div class="alert alert-{{ type }}">
            <ng-content></ng-content>
        </div>
    `
})
export class AlertComponent {

    @Input()
    private type: "success" | "warning" | "danger" | "info" | "";

    @HostBinding("style.display")
    private display = "block";

}
