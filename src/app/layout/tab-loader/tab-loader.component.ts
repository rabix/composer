import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    selector: "ct-tab-loader",
    template: `
        <ct-action-bar></ct-action-bar>
        <ct-circular-loader></ct-circular-loader>
    `,
    styleUrls: ["./tab-loader.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabLoaderComponent {
}
