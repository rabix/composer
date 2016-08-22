import {Component} from "@angular/core";
import {InputProperty} from "../../../../models/input-property.model";
import {InputPortListComponent} from "../types/input-port-list.component";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {OpenInputInspector} from "../../../../action-events/index";

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
    
    constructor(private inputPortService: InputPortService,
                private eventHubService: EventHubService) { }

    private addInput(): void {
        const mockInputPort = new InputProperty({});

        this.inputPortService.addInput(mockInputPort);
        this.inputPortService.setSelected(mockInputPort);

        this.eventHubService.publish(new OpenInputInspector(this.inputPortService.selectedInputPort));
    }
}
