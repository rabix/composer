import {Component, Input} from "@angular/core";
import {CltEditorService} from "../../../clt-editor/shared/clt-editor.service";
import {InputProperty} from "../../../../models/input-property.model";
import {InputPortListComponent} from "../types/input-port-list.component";
import {SidebarType} from "../../../sidebar/shared/sidebar.type";
import {SidebarEvent, SidebarEventType} from "../../../sidebar/shared/sidebar.events";
import {BehaviorSubject} from "rxjs";

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

           

            <!--<div class="container" *ngIf="inputPorts.length > 0">-->
                <input-port-list [(portList)]="inputPorts"></input-port-list>
          <!--  </div>-->
            
            </fieldset>
            <button type="button" class="btn btn-secondary add-input-btn" 
                    (click)="addInput()">Add Input</button>
        </form>
    `
})
export class InputPortsFormComponent {

    @Input()
    private inputPorts: Array<InputProperty> = [];

    private selectedInputPort: BehaviorSubject<InputProperty> = new BehaviorSubject<InputProperty>(null);

    constructor(private guiEditorService: CltEditorService) {

    }

    addInput(): void {
        let mockInputPort = new InputProperty({});

        this.selectedInputPort.next(mockInputPort);
        this.inputPorts.push(mockInputPort);

        let showSidebarEvent: SidebarEvent = {
            sidebarEventType: SidebarEventType.Show,
            sidebarType: SidebarType.ObjectInspector,
            data: {
                stream: this.selectedInputPort
            }
        };

        this.guiEditorService.publishSidebarEvent(showSidebarEvent);
    }
}
