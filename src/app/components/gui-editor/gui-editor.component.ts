import {
    Component,
    OnInit,
    Input,
    trigger,
    state,
    style,
    transition,
    animate
} from "@angular/core";
import {NgFor} from "@angular/common";
import {FileRegistry} from "../../services/file-registry.service";
import {FileModel} from "../../store/models/fs.models";
import {PropertyInput} from "../forms/inputs/property-input.component";

require("./gui-editor.component.scss");

type CommandLineState = "visible" | "hidden";

@Component({
    selector: "gui-editor",
    directives: [NgFor, PropertyInput],
    animations: [
        trigger("commandlineState", [
            state("visible", style({
                height: 70,
                display: "block",
                overflowY: 'auto'
            })),
            state("hidden",   style({
                height: 20,
                display: "none",
                overflowY: 'hidden'
            })),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    template: `
                <div id="guiEditorContainer">
                    <property-input *ngFor="let property of mockInputProperties"
                         class="propertyInput" 
                         [type]="property.type" 
                         [model]="property.value">
                    </property-input>
                    
                    <footer>
                        <div id="commandline"
                             class="commandlineBar"
                             @commandlineState="commandlineState">
                            {{commandlineContent}}
                        </div>
                    
                        <div class="footerButtons">
                            <button type="button" class="btn btn-secondary btn-sm">Issues</button>
                            <button type="button" 
                            class="btn btn-secondary btn-sm"
                            (click)="toggleCommandLine()">Resulting Command</button>
                        </div>
                    </footer>
                </div>
    `
})
export class GuiEditorComponent implements OnInit {
    @Input() file: FileModel;
    commandlineState: CommandLineState = 'hidden';
    /*TODO: generate the commandline*/
    commandlineContent: string = 'This is the command line';

    /* TODO: get tool properties for display, create a service that returns a list of properties based on the tool */
    /*mockInputProperties: Array<any> = [
        {
            type: "DockerRequirement",
            value: {
                dockerPull: "some.docker.image.com"
            }
        },
        {
            type: "baseCommand",
            value: "echo"
        }
    ];*/
    mockInputProperties: Array<any> = [
        {
            type: "DockerRequirement",
            value: null
        },
        {
            type: "baseCommand",
            value: null
        }
    ];

    constructor(private fileRegistry: FileRegistry) {}

    ngOnInit(): void {

    }

    toggleCommandLine() {
        this.commandlineState = this.commandlineState === 'hidden' ? 'visible': 'hidden';
    }

}
