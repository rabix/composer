import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";

@Component({
    selector: "ct-command-line-preview",
    styleUrls: ["./command-line-preview.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="command-line-part" *ngFor="let p of commandLineParts"
              [ct-tooltip]="ctt"
              [class.text-console-warning]="p.type === 'warning'"
              [class.text-console-error]="p.type === 'error'"
              [class.baseCmd-cli]="p.type === 'baseCommand'"
              [class.input-cli]="p.type === 'input'"
              [class.arg-cli]="p.type === 'argument'">{{ p.value.trim() }}<ct-tooltip-content *ngIf="p.value" #ctt>
            <span>
                {{ p.loc }}
            </span>
        </ct-tooltip-content></div>

        
    `
})
export class CommandLinePreviewComponent {

    @Input()
    public commandLineParts: { type: string, value: string }[] = [];
}
