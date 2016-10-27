import {Component, Input, ChangeDetectionStrategy, Output} from "@angular/core";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {ReplaySubject} from "rxjs";

@Component({
    selector: "commandline",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <div class="console-component" [ngClass]="{show: show}">
                <div class="console-content">
                    <span [ngClass]="getClass(p)" *ngFor="let p of commandLineParts">
                        {{ p.value }}
                    </span>
                </div>
            </div>
            
            <button type="button" 
            class="btn btn-sm"
            (click)="toggleCommandLine()">Resulting Command 
                <i class="fa icon-angle" 
                   [ngClass]="{'fa-angle-right': !show, 'fa-angle-up': show}">
                </i>
            </button>
    `
})
export class CommandLineComponent {
    @Input()
    public commandLineParts: CommandLinePart[];

    @Input()
    public show: boolean;

    @Output()
    public select = new ReplaySubject<"commandLine">();

    private getClass(part: CommandLinePart) {
        return {
            "arg-cli": part.type === "argument",
            "baseCmd-cli": part.type === "baseCommand",
            "input-cli": part.type === "input"
        }
    }

    private toggleCommandLine(): void {
        this.select.next("commandLine");
    }
}
