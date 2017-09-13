import {ChangeDetectionStrategy, Component, Input, OnChanges} from "@angular/core";

@Component({
    selector: "ct-command-line-preview",
    styleUrls: ["./command-line-preview.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span *ngFor="let p of list"
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

        <span *ngIf="list.length === 0">
            Your command line preview will appear here
        </span>
    `
})
export class CommandLinePreviewComponent implements OnChanges {

    list: { type: string, value: string }[] = [];

    @Input()
    commandLineParts: { type: string, value: string }[] = [];

    ngOnChanges() {
        if (this.commandLineParts) {
            this.list = this.commandLineParts.filter((item) => !!item.value);
        }
    }
}
