import {
    Component, Input
} from "@angular/core";
import {MarkdownService} from "./markdown.service";
import {SystemService} from "../../platform-providers/system.service";

@Component({
    selector: "ct-markdown",
    template: `
        <div (click)="handleClick($event)" data-test="markdown-val" [innerHtml]="value">
        </div>
    `,
})
export class MarkdownComponent {

    value = "";

    @Input("value")
    set md(value: string) {
        this.value = this.markDownService.parse(value);
    }

    constructor(private markDownService: MarkdownService, private system: SystemService) {
    }

    handleClick($event) {
        // Open link in external browser rather than open it in rabix composer
        if ($event.target.tagName === "A") {
            $event.preventDefault();
            this.system.openLink($event.target.href);
        }

    }
}
