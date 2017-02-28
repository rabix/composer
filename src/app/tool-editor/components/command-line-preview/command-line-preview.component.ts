import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-command-line-preview",
    styleUrls: ["./command-line-preview.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span *ngFor="let p of commandLineParts" [title]="p.loc"
              [class.text-console-warning]="p.type === 'warning'"
              [class.text-console-error]="p.type === 'error'"
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
