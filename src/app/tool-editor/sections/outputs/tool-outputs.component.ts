import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {
    CommandInputParameterModel,
    CommandLineToolModel,
    CommandOutputParameterModel
} from "cwlts/models";
import {ExternalLinks} from "../../../cwl/external-links";
import {ToolOutputListComponent} from "./tool-output-list.component";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-output",
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Output ports
            </span>

            <div class="tc-body">

                <!--Blank Tool Screen-->
                <ct-blank-tool-state *ngIf="!readonly && !model?.outputs.length"
                                     [buttonText]="'Add an Output'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                    The connections to tool outputs. Create an output port for each output file and data item, and also intermediate files
                    if they need to be saved for later. Add secondary files to file ports for related index files.
                </ct-blank-tool-state>

                <!--List of entries-->
                <ct-tool-output-list [inputs]="inputs"
                                     [(entries)]="model.outputs"
                                     (entriesChange)="update.emit($event)"
                                     [location]="location"
                                     [context]="context"
                                     [parent]="model"
                                     [model]="model"
                                     [readonly]="readonly">
                </ct-tool-output-list>

            </div>
        </ct-form-panel>
    `
})
export class ToolOutputsComponent extends DirectiveBase {

    @Input()
    inputs: CommandInputParameterModel[] = [];

    @Input()
    entries: CommandOutputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    location = "";

    /** Context in which expression should be evaluated */
    @Input()
    context: { $job: any };

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    @Output()
    readonly update = new EventEmitter();

    @ViewChild(ToolOutputListComponent) outputList: ToolOutputListComponent;

    helpLink = ExternalLinks.toolOutput;

    addEntry() {
        this.outputList.addEntry();
    }
}
