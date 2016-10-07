import {Component, Input, OnInit} from "@angular/core";
import {InputPortListComponent} from "../types/input-port-list.component";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {OpenInputInspector} from "../../../../action-events/index";
import {CommandLineToolModel} from "cwlts/lib/models/d2sb";

require("./input-ports-form.component.scss");
require("./shared/form.components.scss");

@Component({
    selector: 'inputs-ports-form',
    providers: [InputPortService],
    directives: [InputPortListComponent],
    template: `
        <form>
            <fieldset class="form-group">
                <label>Input ports</label>
                
                <button type="button" class="btn btn-link hide-btn">Hide</button>
    
                <input-port-list></input-port-list>
            </fieldset>
            
            <button type="button" class="btn btn-secondary add-input-btn" 
                    (click)="addInput()">Add Input</button>
        </form>
    `
})
export class InputPortsFormComponent implements OnInit {
    @Input()
    public cltModel: CommandLineToolModel;

    constructor(private inputPortService: InputPortService,
                private eventHubService: EventHubService) { }

    private addInput(): void {
        const newInput = this.cltModel.addInput();

        this.inputPortService.addInput(newInput);
        this.inputPortService.setSelected(newInput);

        this.eventHubService.publish(new OpenInputInspector(this.inputPortService.selectedInputPort));
    }

    ngOnInit() {
        this.inputPortService.setInputs(this.cltModel.inputs);
    }
}
