import {Component, Input, Output} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerImageFormComponent} from "../forms/inputs/forms/docker-image-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {ReplaySubject} from "rxjs";
import {ComponentBase} from "../common/component-base";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    directives: [
        DockerImageFormComponent,
        BaseCommandFormComponent,
        InputPortsFormComponent,
        CommandLineComponent,
    ],
    template: `
            <form class="clt-editor-group" [formGroup]="cltEditorGroup">
                
                <docker-image-form class="input-form" 
                                [group]="cltEditorGroup"
                                [cltModel]="model"
                                [dockerPull]="'some.docker.image.com'">
                </docker-image-form>
                                
                <base-command-form [baseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [form]="cltEditorGroup.controls['baseCommandGroup']"
                                   (update)="setBaseCommand($event)">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model"></inputs-ports-form>
            </form>

            <sidebar-component></sidebar-component>
    `
})
export class CltEditorComponent extends ComponentBase {

    @Input()
    public model: CommandLineToolModel;

    @Output()
    public dirty = new ReplaySubject<boolean>();

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private cltEditorGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();

        this.cltEditorGroup = this.formBuilder.group({
            dockerInputGroup: this.formBuilder.group({}),
            baseCommandGroup: this.formBuilder.group({}),
            inputPortsGroup: this.formBuilder.group({})
        });

        // very elementary dirty checking for tool editor form
        this.tracked = this.cltEditorGroup.valueChanges
            .debounceTime(0) // valueChanges is triggered before form becomes dirty
            .map(_ => this.cltEditorGroup.dirty)
            .distinctUntilChanged()
            .subscribe(this.dirty);
    }

    private setBaseCommand(cmd) {
        this.model.baseCommand = cmd;
    }
}
