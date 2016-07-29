import {
    Component,
    OnInit,
    Input,
} from "@angular/core";
import {NgFor} from "@angular/common";
import {FileModel} from "../../store/models/fs.models";
import {PropertyInput} from "../forms/inputs/property-input.component";
import {GuiEditorService, GuiEditorEvent, GuiEditorEventType, SidebarType} from "./gui-editor.service";
import {GuiEditorAnimations} from "./gui-editor.animations";

require("./gui-editor.component.scss");

type VisibilityState = "visible" | "hidden";
type PropertyPosition = "center" | "left";

@Component({
    selector: "gui-editor",
    providers: [GuiEditorService],
    directives: [NgFor, PropertyInput],
    animations: GuiEditorAnimations,
    /* TODO(mate): too much HTML */
    template: `
                <div id="guiEditorContainer">
                    <main>
                        <property-input @propertyPosition="propertyPosition"
                             *ngFor="let property of mockInputProperties"
                             class="propertyInput" 
                             [type]="property.type" 
                             [model]="property.data">
                        </property-input>
                        
                        <!--TODO(mate): move this to a separate component-->
                        <div id="rightSidebar" @sidebarState="sidebarState">
                            <div id="collapseIcon">
                                <i class="fa fa-lg fa-caret-left" (click)="collapseSidebar()"></i>
                            </div>
                            <div id="sideBarContent">
                                This is the right sidebar content
                            </div>
                        </div>
                    </main>
                   
                   <!--TODO(mate): move this to a separate component-->
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
    commandlineState: VisibilityState = "hidden";
    sidebarState: VisibilityState = "hidden";
    propertyPosition: PropertyPosition = "center";

    /*TODO: generate the commandline*/
    commandlineContent: string = "This is the command line";

    /* TODO: get tool properties for display, create a service that returns a list of properties based on the tool */
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

    constructor(private guiEditorService: GuiEditorService) {
        let self = this;

        this.guiEditorService.publishedEditorEvents.subscribe((event: GuiEditorEvent) => {
            if (event.type === GuiEditorEventType.showSidebar) {
                self.showSideBar(event.data);
            }
        });
    }

    ngOnInit(): void {

    }

    showSideBar(sidebarType: SidebarType): void {
        this.sidebarState = "visible";
        this.togglePropertyPosition();
    }

    collapseSidebar() {
        this.sidebarState = "hidden";
        this.togglePropertyPosition();
    }

    togglePropertyPosition() {
        this.propertyPosition = this.sidebarState === "hidden" ? "center": "left";
    }

    toggleCommandLine(): void {
        this.commandlineState = this.commandlineState === "hidden" ? "visible": "hidden";
    }

}
