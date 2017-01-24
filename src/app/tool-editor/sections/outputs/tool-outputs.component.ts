import {Subject} from "rxjs";
import {
    Component,
    Input,
    ChangeDetectionStrategy,
    Output,
    ViewChild
} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";
import {CommandOutputParameterModel, CommandInputParameterModel} from "cwlts/models/d2sb";
import {ExternalLinks} from "../../../cwl/external-links";
import {ToolOutputListComponent} from "./tool-output-list.component";

require("./output-list.component.scss");

@Component({
    selector: "ct-tool-output",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Output ports
            </span>
            
            <div class="tc-body">
                
                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Everything your tool generates as a result'"
                                     [buttonText]="'Add an Output'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <!--List of entries-->
                <ct-tool-output-list (update)="updateParent($event)" 
                    [inputs]="inputs" 
                    [entries]="entries" 
                    [location]="location" 
                    [context]="context" 
                    [readonly]="readonly">
                </ct-tool-output-list>
                
            </div>
        </ct-form-panel>
    `
})
export class ToolOutputsComponent extends ComponentBase {

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    @Input()
    public entries: CommandOutputParameterModel[] = [];

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

    @ViewChild(ToolOutputListComponent) outputList: ToolOutputListComponent;

    private helpLink = ExternalLinks.toolOutput;

    private addEntry() {
        this.outputList.addEntry();
    }

    private updateParent(fields) {
        this.entries = fields.slice();
        this.update.next(this.entries.slice());
    }
}
