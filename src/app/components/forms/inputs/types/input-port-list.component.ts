import {Component, Input} from "@angular/core";
import {InputPort} from "../../../../models/input-port.model";
import {SidebarType} from "../../../clt-editor/shared/sidebar.type";
import {SidebarEvent} from "../../../clt-editor/shared/gui-editor.events";
import {GuiEditorService} from "../../../clt-editor/shared/gui-editor.service";
import {EventType} from "../../../clt-editor/shared/event.type";

@Component({
    selector: "input-port-list",
    template: `
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
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </div>
                </div>
    `
})
export class InputPortListComponent {
    @Input()
    private portList: Array<InputPort>;

    constructor(private guiEditorService: GuiEditorService) { }

    editProperty(inputPort: InputPort): void {
        let editPropertySidebarEvent: SidebarEvent = {
            eventType: EventType.Edit,
            sidebarType: SidebarType.ObjectInspector,
            data: {
                id: inputPort.id,
                type: inputPort.type,
                value: inputPort.value
            }
        };

        this.guiEditorService.publishSidebarEvent(editPropertySidebarEvent);
    }
}
