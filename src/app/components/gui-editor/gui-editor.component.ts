import {
    Component,
    OnInit,
    Input,
    trigger,
    style,
    animate,
    state,
    transition
} from "@angular/core";
import {NgFor} from "@angular/common";
import {FileModel} from "../../store/models/fs.models";
import {PropertyInput} from "../forms/inputs/property-input.component";
import {GuiEditorService} from "./gui-editor.service";
import {EditorSidebar} from "./sidebar/editor-sidebar.component";
import {PropertyPosition, VisibilityState} from "./animation.states";
import {CommandLine} from "./commandline/commandline.component";

require("./gui-editor.component.scss");

@Component({
    selector: "gui-editor",
    providers: [GuiEditorService],
    directives: [NgFor, PropertyInput, EditorSidebar, CommandLine],
    animations: [
        trigger("propertyPosition", [
            state("left", style({
                margin: '20px 0 0 0'
            })),
            state("center", style({
                margin: '20px auto'
            })),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    template: `
                <div id="guiEditorContainer">
                    <main>
                        <property-input @propertyPosition="propertyPosition"
                             *ngFor="let property of mockInputProperties"
                             class="propertyInput" 
                             [type]="property.type" 
                             [model]="property.data">
                        </property-input>
                        
                        <editor-sidebar (sidebarVisibility)="togglePropertyPosition($event)"></editor-sidebar>
                    </main>
                   
                   <!--TODO(mate): move this to a separate component-->
                    <footer>
                        <commandline [content]="commandlineContent"></commandline>
                    </footer>
                </div>
    `
})
export class GuiEditorComponent implements OnInit {
    /** The file that we are going to use to list the properties*/
    @Input() file: FileModel;
    
    /** Positions of the listed properties */
    propertyPosition: PropertyPosition = "center";

    /* TODO: generate the commandline */
    commandlineContent: string = "This is the command line";

    /* TODO: get tool properties for display, probably create a service that returns a list of properties based on the tool */
    /*mockInputProperties: Array<any> = [
     {
     type: "DockerRequirement",
     data: {
     dockerPull: "some.docker.image.com"
     }
     },
     {
     type: "baseCommand",
     data: {
     command: "echo"
     }
     }
     ];*/
    mockInputProperties: Array<any> = [
        {
            type: "DockerRequirement",
            data: {}
        },
        {
            type: "baseCommand",
            data: {}
        }
    ];

    constructor() { }

    ngOnInit(): void {

    }

    togglePropertyPosition(sidebarVisibility: VisibilityState) {
        this.propertyPosition = sidebarVisibility === "hidden" ? "center": "left";
    }
}
