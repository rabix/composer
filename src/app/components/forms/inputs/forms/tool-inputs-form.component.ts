import {Component} from "@angular/core";
import {GuiEditorService} from "../../../gui-editor/shared/gui-editor.service";
import {ShowSidebarEvent} from "../../../gui-editor/shared/gui-editor.events";

require("./form.components.scss");
require("./tool-inputs-form.component.scss");

@Component({
    selector: 'tool-inputs-form',
    template: `
        <form>
         <fieldset class="form-group">
            <label>Input ports</label>
            
            <button type="button" class="btn btn-secondary hide-btn">Hide</button>

            <div class="container">
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
                
                <!--TODO: move this-->
                <div class="row tool-input-row">
                    <div class="col-sm-2">
                        <i class="fa fa-align-justify tool-input-icon" aria-hidden="true"></i>
                    </div>
                    <div class="col-sm-3">
                        input_bam_files               
                    </div>
                    <div class="col-sm-1">
                        int
                    </div>
                    
                    <div class="col-sm-4">
                        Not defined
                    </div>
                    <div class="col-sm-1 icons-right-side">
                        <i class="fa fa-pencil tool-input-icon" 
                           aria-hidden="true" 
                           (click)="openObjectInspector()"></i>
                    </div>
                    <div class="col-sm-1 icons-right-side tool-input-icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
            
            </fieldset>
            <button type="button" class="btn btn-secondary add-input-btn">Add Input</button>
        </form>
    `
})
export class ToolInputsFormComponent {

    constructor(private guiEditorService: GuiEditorService) { }

    openObjectInspector() {
        let showSidebarEvent: ShowSidebarEvent = {
            data: {
                sidebarType: "object-inspector"
            }
        };

        this.guiEditorService.publishSidebarEvent(showSidebarEvent);
    }
}
