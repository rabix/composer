import {Component, ChangeDetectionStrategy, Input} from "@angular/core";
require("./command-line-preview.component.scss");

@Component({
    selector: "ct-command-line-preview",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span *ngFor="let p of commandLineParts"
              [class.warning-text]="p.type === 'warning'"
              [class.error-text]="p.type === 'error'"
              [class.baseCmd-cli]="p.type === 'baseCommand'"
              [class.input-cli]="p.type === 'input'"
              [class.arg-cli]="p.type === 'argument'">
            {{ p.value }}
        </span>
    `
})
export class CommandLinePreviewComponent {

    @Input()
    public commandLineParts: { type: string, value: string }[] = [];
}
