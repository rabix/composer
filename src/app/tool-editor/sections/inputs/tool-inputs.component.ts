import {Subject} from "rxjs";
import {
    Component,
    Input,
    ChangeDetectionStrategy,
    Output,
    ViewChild
} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {ToolInputListComponent} from "./tool-input-list-component";


require("./input-list.component.scss");

@Component({
    selector: "ct-tool-input",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Input ports
            </span>
            
            <div class="tc-body">
                
                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Files, parameters, and other stuff displayed in the tools command line'"
                                     [buttonText]="'Add an Input'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <!--List of entries-->
                <ct-tool-input-list (update)="updateParent($event)"
                    [entries]="entries" 
                    [location]="location" 
                    [context]="context" 
                    [readonly]="readonly">
                </ct-tool-input-list>
                
            </div>
        </ct-form-panel>
    `
})
export class ToolInputsComponent extends ComponentBase {

    @Input()
    public entries: SBDraft2CommandInputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: {$job: any};

    @Input()
    public readonly = false;

    @Output()
    public readonly update = new Subject();

    @ViewChild(ToolInputListComponent) inputList: ToolInputListComponent;

    private addEntry() {
        this.inputList.addEntry();
    }

    private updateParent(fields) {
        this.entries = fields.slice();
        this.update.next(this.entries.slice());
    }

}
