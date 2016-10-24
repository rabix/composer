import {Component, Input} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerInputFormComponent} from "../forms/inputs/forms/docker-input-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {CommandLineToolModel} from "cwlts/models/d2sb";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    directives: [
        DockerInputFormComponent,
        BaseCommandFormComponent,
        InputPortsFormComponent,
        CommandLineComponent,
    ],
    template: `
            <form class="clt-editor-group" [formGroup]="cltEditorGroup">
                
                <docker-input-form class="input-form" 
                                [group]="cltEditorGroup"
                                [cltModel]="model"
                                [dockerPull]="'some.docker.image.com'">
                </docker-input-form>
                                
                <base-command-form [toolBaseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [baseCommandForm]="cltEditorGroup.controls.baseCommandGroup"
                                   (onUpdate)="setBaseCommand($event)">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model"></inputs-ports-form>
            </form>

            <sidebar-component></sidebar-component>
    `
})
export class CltEditorComponent {

    @Input()
    private model: CommandLineToolModel;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private cltEditorGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) { }

    private setBaseCommand(cmd) {
        this.model.baseCommand = cmd;
    }

    ngOnInit() {
        this.cltEditorGroup = this.formBuilder.group({
            dockerInputGroup: this.formBuilder.group({}),
            baseCommandGroup: this.formBuilder.group({}),
            inputPortsGroup: this.formBuilder.group({})
        });
    }
}
