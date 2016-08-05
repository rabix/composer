import {
    Component,
    Input,
    trigger,
    style,
    animate,
    state,
    transition
} from "@angular/core";
import {FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {FileModel} from "../../store/models/fs.models";
import {GuiEditorService} from "./shared/gui-editor.service";
import {EditorSidebarComponent} from "./sidebar/editor-sidebar.component";
import {FormPosition, VisibilityState} from "./animation.states";
import {BehaviorSubject} from "rxjs/Rx";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerInputFormComponent} from "../forms/inputs/forms/docker-input-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";

require("./gui-editor.component.scss");

@Component({
    selector: "gui-editor",
    providers: [GuiEditorService],
    directives: [
        DockerInputFormComponent,
        BaseCommandFormComponent,
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
            <form (ngSubmit)="onSubmit()" [formGroup]="guiEditorGroup">
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
            </form>
                  
            <editor-sidebar [sidebarVisibility]="sidebarVisibility"></editor-sidebar>
          
            <div class="footer">
                <commandline [content]="commandlineContent"></commandline>
            </div>
    `
})
export class GuiEditorComponent {
    /** The file that we are going to use to list the properties*/
    @Input()
    private file: FileModel;

    /** Positions of the listed properties */
    private formPosition: FormPosition = "center";

    /* TODO: generate the commandline */
    private commandlineContent: string = "This is the command line";

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private guiEditorGroup: FormGroup;

    private sidebarVisibility: BehaviorSubject<VisibilityState>;

    constructor(private formBuilder: FormBuilder) {
        this.guiEditorGroup = this.formBuilder.group({});
        this.sidebarVisibility = new BehaviorSubject<VisibilityState>("hidden");

        this.sidebarVisibility.subscribe((state: VisibilityState) => {
            this.formPosition = state === "hidden" ? "center": "left";
        });
    }
}
