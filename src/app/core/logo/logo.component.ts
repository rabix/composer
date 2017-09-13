import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    selector: "ct-logo",
    template: `
        <div class="logo"></div>
    `,
    styleUrls: ["./logo.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent {
}
