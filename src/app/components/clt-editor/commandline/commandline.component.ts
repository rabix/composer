import {Component, Input} from "@angular/core";

/** TODO: make this switch between an expression editor and an object inspector*/
@Component({
    selector: "commandline",
    template: `
            <div class="console-component" [ngClass]="{show: showCommandLine}">
                <div class="console-content">
                    {{content}}
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
    /** Content of the command line */
    @Input()
    public content: string;

    private showCommandLine = false;

    private toggleCommandLine(): void {
        this.showCommandLine = !this.showCommandLine;
    }
}
