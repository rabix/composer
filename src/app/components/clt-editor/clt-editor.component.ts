import {Component, Input, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {ProcessRequirement} from "cwlts/mappings/v1.0";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    template: `
            <form class="clt-editor-group" [formGroup]="formGroup">
                <docker-image-form [dockerRequirement]="model.hints.DockerRequirement"
                                   [form]="formGroup.controls['dockerGroup']"
                                   (update)="setRequirement($event, true)">
                </docker-image-form>
                                
                <base-command-form [baseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [form]="formGroup.controls['baseCommandGroup']"
                                   (update)="setBaseCommand($event)">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model"></inputs-ports-form>
                
                <ct-output-ports [entries]="model.outputs || []" [readonly]="readonly"></ct-output-ports>
                
                <ct-hint-list [entries]="model.hints || {}" [readonly]="readonly"></ct-hint-list>
                
                <ct-argument-list [entries]="model.arguments || []" [readonly]="readonly"></ct-argument-list>
                
                <ct-file-def-list [entries]="model.requirements.CreateFileRequirement?.fileDef || []"></ct-file-def-list>
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

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.formGroup.addControl("dockerGroup", this.formBuilder.group({}));
        this.formGroup.addControl("baseCommandGroup", this.formBuilder.group({}));
        this.formGroup.addControl("inputPortsGroup", this.formBuilder.group({}));
    }

    private setRequirement(req: ProcessRequirement, hint: boolean) {
        this.model.setRequirement(req, hint);
    }

    private setBaseCommand(list: ExpressionModel[]) {
        this.model.baseCommand = [];
        list.forEach(cmd => this.model.addBaseCommand(cmd));
    }
}
