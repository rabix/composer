import {Component, Input, Output, ViewChild, EventEmitter} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
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
                                     [title]="'Files, parameters, and other stuff displayed in the tools command line'"
                                     [buttonText]="'Add an Input'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>

                <!--List of entries-->
                <ct-tool-input-list [(entries)]="model.inputs"
                                    (entriesChange)="update.emit($event)"
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
