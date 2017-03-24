import {ChangeDetectionStrategy, Component, Input} from "@angular/core";

@Component({
    selector: "ct-command-line-preview",
    styleUrls: ["./command-line-preview.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span *ngFor="let p of commandLineParts"
              [class.text-console-warning]="p.type === 'warning'"
              [class.text-console-error]="p.type === 'error'"
              [class.baseCmd-cli]="p.type === 'baseCommand'"
              [class.input-cli]="p.type === 'input'"
              [class.arg-cli]="p.type === 'argument'"
              [class.stream-cli]="p.type === 'stdin' || p.type === 'stdout'">
            <div class="command-line-part" *ngIf="p.value" [ct-tooltip]="ctt">{{ p.value.trim() }}<ct-tooltip-content #ctt>
                <span>
                    {{ p.loc }}
                </span>
            </ct-tooltip-content></div>
        </span>
    `
})
export class CommandLinePreviewComponent {

    @Input()
    public commandLineParts: { type: string, value: string }[] = [];
}
