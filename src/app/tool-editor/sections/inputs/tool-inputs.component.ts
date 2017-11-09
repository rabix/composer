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
                <ct-blank-tool-state *ngIf="!readonly && !model?.inputs.length"
                                     data-test="tool-add-input-button"
                                     [buttonText]="'Add an Input'"
                                     [description]="blankStateDescription"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

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

    blankStateDescription = `The connections to tool parameters or options that can be set each time the tool is executed. Create a port for each
    input data file and for other variable parameters and options here. Add secondary files to file ports for related index
    files.`;

    addEntry() {
        this.inputList.addEntry();
    }

}
