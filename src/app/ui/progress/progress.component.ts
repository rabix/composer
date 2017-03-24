import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    selector: "ct-progress",
    template: `
        <div class="indeterminate"></div>
    `,
    styleUrls: ["./progress.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressComponent {
}
