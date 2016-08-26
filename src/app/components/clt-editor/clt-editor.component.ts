import {Component, Input, trigger, style, animate, state, transition} from "@angular/core";
import {FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {FileModel} from "../../store/models/fs.models";
import {FormPosition} from "./animation.states";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerInputFormComponent} from "../forms/inputs/forms/docker-input-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {InputProperty} from "../../models/input-property.model";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {
    OpenInputInspector,
    OpenExpressionEditor,
    CloseInputInspector, EventHubAction, CloseExpressionEditor
} from "../../action-events/index";

require("./clt-editor.component.scss");

@Component({
    selector: "clt-editor",
    directives: [
        DockerInputFormComponent,
        BaseCommandFormComponent,
        InputPortsFormComponent,
        CommandLineComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES
    ],
    animations: [
        trigger("formPosition", [
            state("left", style({
                margin: "20px 0 0 0"
            })),
            state("center", style({
                margin: "20px auto"
            })),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    template: `
            <form class="clt-editor-group"
                  [formGroup]="cltEditorGroup">
                <docker-input-form @formPosition="formPosition"
                                class="input-form" 
                                [group]="cltEditorGroup"
                                [dockerPull]="'some.docker.image.com'">
                </docker-input-form>
                                
                <base-command-form @formPosition="formPosition"
                                class="input-form" 
                                [group]="cltEditorGroup"
                                [baseCommand]="'echo'">
                </base-command-form>
                
                <inputs-ports-form @formPosition="formPosition"
                                  class="input-form"
                                  [inputPorts]="toolInputPorts"></inputs-ports-form>
            </form>
    `
})
export class CltEditorComponent {
    /** The file that we are going to use to list the properties */
    @Input()
    public file: FileModel;

    /** TODO: change array type to CommandInputParameterModel when we have the models */
    @Input()
    public toolInputs: Array<any>;

    private toolInputPorts: BehaviorSubject<InputProperty[]> = new BehaviorSubject<InputProperty[]>([]);

    /** Positions of the listed properties */
    private formPosition: FormPosition = "center";

    /* TODO: generate the commandline */
    private commandlineContent: string = "This is the command line";

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private cltEditorGroup: FormGroup;

    private closeSidebarActions = [];

    constructor(private formBuilder: FormBuilder,
                private eventHubService: EventHubService) {
        this.cltEditorGroup = this.formBuilder.group({});

        /* Opening the sidebar */
        this.eventHubService.on(OpenInputInspector).subscribe(() => {
            this.closeSidebarActions.push(CloseInputInspector);
            this.formPosition = "left";
        });

        this.eventHubService.on(OpenExpressionEditor).subscribe(() => {
            this.closeSidebarActions.push(CloseExpressionEditor);
            this.formPosition = "left";
        });

        /* Closing the sidebar */
        this.eventHubService.on(CloseInputInspector).subscribe(() => {
            this.deleteSidebarActionFromArray(CloseInputInspector);
        });

        this.eventHubService.on(CloseExpressionEditor).subscribe(() => {
            this.deleteSidebarActionFromArray(CloseExpressionEditor);
        });
    }

    deleteSidebarActionFromArray(action) {
        this.closeSidebarActions = this.closeSidebarActions.filter(sidebarAction => {
            return sidebarAction !== action;
        });

        if (this.closeSidebarActions.length === 0) {
            this.formPosition = "center";
        }
    }
}
