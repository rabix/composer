import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {FileDef} from "cwlts/mappings/d2sb/FileDef";
import {CommandInputParameterModel as InputProperty} from "cwlts/models/d2sb";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    template: `
            <form class="clt-editor-group" [formGroup]="formGroup">
                <docker-image-form class="input-form" 
                                [group]="formGroup"
                                [cltModel]="model"
                                [dockerPull]="'some.docker.image.com'">
                </docker-image-form>
                                
                <base-command-form [baseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [form]="formGroup.controls['baseCommandGroup']"
                                   (update)="setBaseCommand($event)">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model" 
                                   [form]="formGroup.controls['inputPortsGroup']"
                                   (update)="setInputs($event)"></inputs-ports-form>
                
                <ct-output-ports [entries]="model.outputs || []" [readonly]="readonly"></ct-output-ports>
                
                <ct-hint-list [entries]="model.hints || []" [readonly]="readonly"></ct-hint-list>
                
                <ct-argument-list [entries]="model.arguments || []" [readonly]="readonly"></ct-argument-list>
                
                <ct-file-def-list [entries]="fileDefs || []"></ct-file-def-list>
            </form>

            <sidebar-component></sidebar-component>
    `
})
export class CltEditorComponent extends ComponentBase implements OnInit {

    @Input()
    public model: CommandLineToolModel;

    @Input()
    public readonly: boolean;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    @Input()
    public formGroup: FormGroup;

    private fileDefs: FileDef[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        console.log("Model", this.model);
        this.formGroup.addControl("dockerInputGroup", this.formBuilder.group({}));
        this.formGroup.addControl("baseCommandGroup", this.formBuilder.group({}));
        this.formGroup.addControl("inputPortsGroup", this.formBuilder.group({}));

        this.fileDefs = Object.keys(this.model.requirements)
            .map(key => this.model.requirements[key])
            .filter(req => req.class === "CreateFileRequirement")
            .map(req => req.fileDef)
            .reduce((acc, item) => acc.concat(item) , []);
    }

    private setBaseCommand(list: ExpressionModel[]) {
        this.model.baseCommand = [];
        list.forEach(cmd => this.model.addBaseCommand(cmd));
    }

    private setInputs(inputs: InputProperty[]) {
        this.model.inputs = [];
        inputs.forEach((input: InputProperty) => {
            this.model.addInput(input)
        });
    }
}
