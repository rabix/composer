import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    selector: "ct-logo",
    template: `
        <span class="project-name">Rabix</span>
        <span class="product-name">Composer</span>
    `,
    styleUrls: ["./logo.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent {
}
