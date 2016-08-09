import {Component, Input, OnInit} from "@angular/core";
import {GuiEditorService} from "../../../clt-editor/shared/gui-editor.service";
import {InputPort} from "../../../../models/input-port.model";
import {InputPortListComponent} from "../types/input-port-list.component";
import {SidebarType} from "../../../clt-editor/shared/sidebar.type";
import {SidebarEvent} from "../../../clt-editor/shared/gui-editor.events";
import {EventType} from "../../../clt-editor/shared/event.type";

require("./form.components.scss");
require("./input-ports-form.component.scss");

@Component({
    selector: 'inputs-ports-form',
    directives: [InputPortListComponent],
    template: `
        <form>
         <fieldset class="form-group">
            <label>Input ports</label>
            
            <button type="button" class="btn btn-secondary hide-btn">Hide</button>

            <div *ngIf="inputPorts.length === 0" class="col-sm-12">
                No input ports defined.
            </div>

            <div class="container" *ngIf="inputPorts.length > 0">
                <input-port-list [portList]="inputPorts"></input-port-list>
            </div>
            
            </fieldset>
            <button type="button" class="btn btn-secondary add-input-btn" 
                    (click)="addInput()">Add Input</button>
        </form>
    `
})
export class InputPortsFormComponent implements OnInit {

    @Input()
    private inputPorts: Array<InputPort> = [];

    constructor(private guiEditorService: GuiEditorService) { }

    ngOnInit(): void {
        /*let mockInputPort = new InputPort({
         id: "input_bam_files",
         type: "int",
         value: "Not defined"
         });

         this.inputPorts.push(mockInputPort);*/
    }

    addInput(): void {
        let showSidebarEvent: SidebarEvent = {
            eventType: EventType.Add,
            sidebarType: SidebarType.ObjectInspector
        };

        this.guiEditorService.publishSidebarEvent(showSidebarEvent);
    }
}
