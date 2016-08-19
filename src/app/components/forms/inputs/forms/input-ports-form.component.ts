import {Component} from "@angular/core";
import {CltEditorService} from "../../../clt-editor/shared/clt-editor.service";
import {InputProperty} from "../../../../models/input-property.model";
import {InputPortListComponent} from "../types/input-port-list.component";
import {SidebarType} from "../../../sidebar/shared/sidebar.type";
import {SidebarEvent, SidebarEventType} from "../../../sidebar/shared/sidebar.events";
import {InputPortService} from "../../../../services/input-port/input-port.service";

require("./form.components.scss");
require("./input-ports-form.component.scss");

@Component({
    selector: 'inputs-ports-form',
    providers: [InputPortService],
    directives: [InputPortListComponent],
    template: `
        <form>
            <fieldset class="form-group">
                <label>Input ports</label>
                
                <button type="button" class="btn btn-secondary hide-btn">Hide</button>
    
                <input-port-list></input-port-list>
            </fieldset>
            
            <button type="button" class="btn btn-secondary add-input-btn" 
                    (click)="addInput()">Add Input</button>
        </form>
    `
})
export class InputPortsFormComponent {
    
    constructor(private guiEditorService: CltEditorService,
                private inputPortService: InputPortService) { }

    private addInput(): void {
        const mockInputPort = new InputProperty({});

        this.inputPortService.addInput(mockInputPort);
        this.inputPortService.setSelected(mockInputPort);
        
        const showSidebarEvent: SidebarEvent = {
            sidebarEventType: SidebarEventType.Show,
            sidebarType: SidebarType.ObjectInspector,
            data: {
                stream: this.inputPortService.selectedInputPort
            }
        };

        this.guiEditorService.sidebarEvents.next(showSidebarEvent);
    }
}
