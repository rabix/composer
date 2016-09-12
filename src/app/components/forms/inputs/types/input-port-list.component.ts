import {Component} from "@angular/core";
import {InputPortService} from "../../../../services/input-port/input-port.service";
import {CloseInputInspector, OpenInputInspector} from "../../../../action-events/index";
import {EventHubService} from "../../../../services/event-hub/event-hub.service";
import {CommandInputParameterModel as InputProperty} from "cwlts/lib/models/d2sb";

@Component({
    selector: "input-port-list",
    template: `
            <div *ngIf="portList.length > 0">
            
                <div class="row">
                    <div class="col-sm-4">
                        Value
                    </div>
                    <div class="col-sm-3">
                        ID               
                    </div>
                    <div class="col-sm-1">
                        Type
                    </div>
                </div>

                 <div class="tool-input-row" 
                      *ngFor="let inputPort of portList"  
                      (click)="editProperty(inputPort)">  
                 
                      
                    <div class="col-sm-4">
                        {{inputPort.value}}     
                    </div>
                      
                    <div class="col-sm-3">
                        {{inputPort.id}}         
                    </div>
                    
                    <div class="col-sm-1">
                        {{inputPort.type}}      
                    </div>
                    
                    <div class="col-sm-1 pull-right tool-input-icon">
                        <i class="fa fa-trash" 
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

    private portList: Array<InputProperty> = [];

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
        this.inputPortService.deleteInputPort(inputPort);

        if (this.selectedInputPort === inputPort) {
            this.eventHubService.publish(new CloseInputInspector());
        }
    }
}
