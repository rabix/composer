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
                                     [title]="'Everything your tool generates as a result'"
                                     [buttonText]="'Add an Output'"
                                     [learnMoreURL]="helpLink"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <!--List of entries-->
                <ct-tool-output-list [inputs]="inputs"
                                     [(entries)]="model.outputs"
                                     (entriesChange)="update.emit($event)"
                                     [location]="location"
                                     [context]="context"
                                     [parent]="model"
                                     [readonly]="readonly">
                </ct-tool-output-list>

            </div>
        </ct-form-panel>
    `
})
export class ToolOutputsComponent extends DirectiveBase {

    @Input()
    public inputs: CommandInputParameterModel[] = [];

    @Input()
    public entries: CommandOutputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    public location = "";

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job: any };

    @Input()
    public readonly = false;

    @Input()
    public model: CommandLineToolModel;

    @Output()
    public readonly update = new EventEmitter();

    @ViewChild(ToolOutputListComponent) outputList: ToolOutputListComponent;

    public helpLink = ExternalLinks.toolOutput;

    private addEntry() {
        this.outputList.addEntry();
    }
}
