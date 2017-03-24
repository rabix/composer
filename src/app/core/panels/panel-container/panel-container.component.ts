import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";

@Component({
    selector: "ct-panel-container",
    template: `
        <ng-content></ng-content>
    `,
    styleUrls: ["./panel-container.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContainerComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
