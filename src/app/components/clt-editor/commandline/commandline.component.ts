import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";

/** TODO: make this switch between an expression editor and an object inspector*/
@Component({
    selector: "commandline",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
            <div class="console-component" [ngClass]="{show: showCommandLine}">
                <div class="console-content">
                    <span [ngClass]="getClass(p)" *ngFor="let p of commandLineParts">
                        {{ p.value }}
                    </span>
                </div>
            </div>
            
            <button type="button" 
            class="btn btn-sm"
            (click)="toggleCommandLine()">Resulting Command 
                <i class="fa" 
                   [ngClass]="{'fa-angle-right': !showCommandLine, 'fa-angle-up': showCommandLine}">
                </i>
            </button>
    `
})
export class CommandLineComponent {
    @Input()
    public commandLineParts: CommandLinePart[];

    private showCommandLine = false;

    private getClass(part: CommandLinePart) {
        return {
            "arg-cli": part.type === "argument",
            "baseCmd-cli": part.type === "baseCommand",
            "input-cli": part.type === "input"
        }
    }

    private toggleCommandLine(): void {
        this.showCommandLine = !this.showCommandLine;
    }
}
