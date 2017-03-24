import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    selector: "ct-line-loader",
    styleUrls: ["./line-loader.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-progress></ct-progress>
    `
})
export class LineLoaderComponent {
}
