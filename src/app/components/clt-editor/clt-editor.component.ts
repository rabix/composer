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
                                   [baseCommandForm]="cltEditorGroup.controls.baseCommandGroup">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model"></inputs-ports-form>
            </form>
    `
})
export class CltEditorComponent {

    @Input()
    private model: CommandLineToolModel;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private cltEditorGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.cltEditorGroup = this.formBuilder.group({
            dockerInputGroup: this.formBuilder.group({}),
            baseCommandGroup: this.formBuilder.group({}),
            inputPortsGroup: this.formBuilder.group({})
        });
    }

    ngOnInit() {
    }

}
