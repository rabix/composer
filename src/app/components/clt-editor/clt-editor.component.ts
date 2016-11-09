import {Component, Input, Output, OnDestroy} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerImageFormComponent} from "../forms/inputs/forms/docker-image-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {Subscription, ReplaySubject} from "rxjs";
import {OutputPortsComponent} from "./output-ports/output-ports.component";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    directives: [
        DockerImageFormComponent,
        BaseCommandFormComponent,
        InputPortsFormComponent,
        CommandLineComponent,
        OutputPortsComponent,
    ],
    template: `
            <form class="clt-editor-group" [formGroup]="cltEditorGroup">
                
                <docker-image-form class="input-form" 
                                [group]="cltEditorGroup"
                                [cltModel]="model"
                                [dockerPull]="'some.docker.image.com'">
                </docker-image-form>
                                
                <base-command-form [toolBaseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [baseCommandForm]="cltEditorGroup.controls['baseCommandGroup']"
                                   (onUpdate)="setBaseCommand($event)">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model"></inputs-ports-form>
                
                <ct-output-ports [entries]="model.outputs"></ct-output-ports>
                
                
            </form>

            <sidebar-component></sidebar-component>
    `
})
export class CltEditorComponent implements OnDestroy {

    @Input()
    public model: CommandLineToolModel;

    @Output()
    public isDirty: ReplaySubject<any> = new ReplaySubject();

    private subs: Subscription[] = [];

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private cltEditorGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.cltEditorGroup = this.formBuilder.group({
            dockerInputGroup: this.formBuilder.group({}),
            baseCommandGroup: this.formBuilder.group({}),
            inputPortsGroup: this.formBuilder.group({}),
        });


        // very elementary dirty checking for tool editor form
        this.subs.push(this.cltEditorGroup.valueChanges
            .map(_ => this.cltEditorGroup.dirty)
            .distinctUntilChanged()
            .subscribe(this.isDirty)
        );
    }

    private setBaseCommand(cmd) {
        this.model.baseCommand = cmd;
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }
}
