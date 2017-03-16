import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    selector: "ct-block-loader",
    styleUrls: ["./block-loader.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-progress></ct-progress>
    `
})
export class BlockLoaderComponent {
}
