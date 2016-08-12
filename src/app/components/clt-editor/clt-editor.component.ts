import {Component, Input, trigger, style, animate, state, transition} from "@angular/core";
import {FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {FileModel} from "../../store/models/fs.models";
import {CltEditorService} from "./shared/clt-editor.service";
import {EditorSidebarComponent} from "../sidebar/editor-sidebar.component";
import {FormPosition} from "./animation.states";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerInputFormComponent} from "../forms/inputs/forms/docker-input-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {SidebarEvent, SidebarEventType} from "../sidebar/shared/sidebar.events";

require("./clt-editor.component.scss");

@Component({
    selector: "clt-editor",
    providers: [CltEditorService],
    directives: [
        DockerInputFormComponent,
        BaseCommandFormComponent,
        InputPortsFormComponent,
        EditorSidebarComponent,
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
                  [formGroup]="guiEditorGroup">
                <docker-input-form @formPosition="formPosition"
                                class="input-form" 
                                [group]="guiEditorGroup"
                                [dockerPull]="'some.docker.image.com'">
                </docker-input-form>
                                
                <base-command-form @formPosition="formPosition"
                                class="input-form" 
                                [group]="guiEditorGroup"
                                [baseCommand]="'echo'">
                </base-command-form>
                
                <inputs-ports-form @formPosition="formPosition"
                                  class="input-form"></inputs-ports-form>
            </form>
            <editor-sidebar></editor-sidebar>
    `
})
export class CltEditorComponent {
    /** The file that we are going to use to list the properties */
    @Input()
    private file: FileModel;

    /** TODO: change array type to CommandInputParameterModel when we have the models */
    @Input()
    private toolInputs: Array<any>;

    /** Positions of the listed properties */
    private formPosition: FormPosition = "center";

    /* TODO: generate the commandline */
    private commandlineContent: string = "This is the command line";

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private guiEditorGroup: FormGroup;
    
    constructor(private formBuilder: FormBuilder,
                private guiEditorService: CltEditorService) {
        this.guiEditorGroup = this.formBuilder.group({});

        this.guiEditorService.publishedSidebarEvents.subscribe((event: SidebarEvent) => {
            let event = event.sidebarEventType;
            this.formPosition = event === SidebarEventType.Hide ? "center": "left";
        });
    }
}
