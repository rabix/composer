import {
    Component,
    style,
    animate,
    state,
    transition,
    trigger,
    Input
} from "@angular/core";
import {VisibilityState} from "../animation.states";

require ("./commandline.component.scss");

/** TODO: make this switch between an expression editor and an object inspector*/
@Component({
    selector: "commandline",
    animations: [
        trigger("commandlineState", [
            state("visible", style({
                height: 70,
                display: "block",
                overflowY: "auto"
            })),
            state("hidden", style({
                height: 20,
                display: "none",
                overflowY: "hidden"
            })),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    template: `
            <div class="commandline-component"
                @commandlineState="commandlineState">
                {{content}}
            </div>
            
            <div class="footer-buttons">
                <button type="button" class="btn btn-secondary btn-sm">Issues</button>
                <button type="button" 
                class="btn btn-secondary btn-sm"
                (click)="toggleCommandLine()">Resulting Command</button>
            </div>
    `
})
export class CommandLineComponent {
    /** Content of the command line */
    @Input()
    public content: string;

    /** Sate of the commandline animation */
    private commandlineState: VisibilityState = "hidden";

    private toggleCommandLine(): void {
        this.commandlineState = this.commandlineState === "hidden" ? "visible": "hidden";
    }
}
