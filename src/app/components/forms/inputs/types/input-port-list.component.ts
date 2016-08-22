import {Component} from "@angular/core";
import {InputProperty} from "../../../../models/input-property.model";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {CloseInputInspector, OpenInputInspector} from "../../../../action-events/index";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";

@Component({
    selector: "input-port-list",
    template: `
            <div *ngIf="portList.length > 0">
            
                <div class="row">
                    <div class="col-sm-2">
                    </div>
                    <div class="col-sm-3">
                        ID               
                    </div>
                    <div class="col-sm-1">
                        Type
                    </div>
                    <div class="col-sm-4">
                        Value
                    </div>
                </div>

                 <div class="row tool-input-row" *ngFor="let inputPort of portList">  
                    <div class="col-sm-2">
                        <i class="fa fa-align-justify tool-input-icon" aria-hidden="true"></i>
                    </div>
                    <div class="col-sm-3">
                        {{inputPort.id}}         
                    </div>
                    <div class="col-sm-1">
                        {{inputPort.type}}      
                    </div>
                    
                    <div class="col-sm-4">
                        {{inputPort.value}}     
                    </div>
                    
                    <div class="col-sm-1 icons-right-side">
                        <i class="fa fa-pencil tool-input-icon" 
                           aria-hidden="true" 
                           (click)="editProperty(inputPort)"></i>
                    </div>
                    
                    <div class="col-sm-1 icons-right-side tool-input-icon">
                        <i class="fa fa-times" 
                           aria-hidden="true"
                           (click)="removeProperty(inputPort)"></i>
                    </div>
                </div>
                
        </div> <!-- List end -->
        
         <div *ngIf="portList.length === 0" class="col-sm-12">
                No input ports defined.
        </div>
    `
})
export class InputPortListComponent {

    public portList: Array<InputProperty> = [];

    private selectedInputPort: InputProperty;

    constructor(private inputPortService: InputPortService,
                private eventHubService: EventHubService) {

        this.inputPortService.inputPorts.subscribe((portList: InputProperty[]) => {
            this.portList = portList;
        });

        this.inputPortService.selectedInputPort.subscribe(inputPort => {
            this.selectedInputPort = inputPort;
        });
    }

    private editProperty(inputPort: InputProperty): void {
        this.inputPortService.setSelected(inputPort);
        this.eventHubService.publish(new OpenInputInspector(this.inputPortService.selectedInputPort));
    }

    private removeProperty(inputPort: InputProperty): void {
        /** TODO: figure out how we want to identify our inputs */
        if (!inputPort.id) {
            return;
        }

        this.inputPortService.deleteInputPort(inputPort);

        if (this.selectedInputPort.id === inputPort.id) {
            this.eventHubService.publish(new CloseInputInspector());
        }
    }
}
