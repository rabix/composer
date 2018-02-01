import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel, CommandOutputParameterModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ToolOutputListComponent} from "./tool-output-list.component";

@Component({
    selector: "ct-tool-output",
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Output ports
            </span>

            <div class="tc-body">

                <!--Blank Tool Screen-->
                <ct-blank-state *ngIf="!readonly && !model?.outputs.length" (buttonClick)="addEntry()"
                                [learnMoreURL]="'http://docs.rabix.io/the-tool-editor#output-ports'"
                                [hasAction]="true">
                    <section tc-button-text>Add an Output</section>
                    <section tc-description>
                        Create an output port for each output file and data item. You can also create output ports for
                        intermediate files if you need to save them for later. List the index files a tool creates under
                        secondary files for outputs.
                    </section>
                </ct-blank-state>

                <!--List of entries-->
                <ct-tool-output-list [inputs]="inputs"
                                     [(entries)]="model.outputs"
                                     (update)="update.emit($event)"
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

    addEntry() {
        this.outputList.addEntry();
    }
}
