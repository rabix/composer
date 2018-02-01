import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {ToolInputListComponent} from "./tool-input-list.component";

@Component({
    selector: "ct-tool-input",
    styleUrls: ["./tool-inputs.component.scss"],
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Input ports
            </span>

            <div class="tc-body">

                <!--Blank Tool Screen-->
                <ct-blank-state *ngIf="!readonly && !model?.inputs.length" (buttonClick)="addEntry()"
                                [learnMoreURL]="'http://docs.rabix.io/the-tool-editor#input-ports'"
                                [hasAction]="true">
                    <section tc-button-text>Add an Input</section>
                    <section tc-description>
                        Create an input port for each input data file or for other variable parameters and options.
                        Set connections to tool parameters or options which can be specified each time the tool is
                        executed. Add secondary files to file ports for related index files.
                    </section>
                </ct-blank-state>

                <!--List of entries-->
                <ct-tool-input-list [(entries)]="model.inputs"
                                    (update)="update.emit($event)"
                                    [location]="location"
                                    [parent]="model"
                                    [model]="model"
                                    [readonly]="readonly">
                </ct-tool-input-list>

            </div>
        </ct-form-panel>
    `
})
export class ToolInputsComponent extends DirectiveBase {

    @Input()
    entries: CommandInputParameterModel[] = [];

    /** Model location entry, used for tracing the path in the json document */
    @Input()
    location = "";

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    @Output()
    update = new EventEmitter();

    @ViewChild(ToolInputListComponent)
    private inputList: ToolInputListComponent;

    addEntry() {
        this.inputList.addEntry();
    }

}
