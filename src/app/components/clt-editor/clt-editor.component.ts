import {Component, Input, trigger, style, animate, state, transition, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {FileModel} from "../../store/models/fs.models";
import {FormPosition} from "./animation.states";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerInputFormComponent} from "../forms/inputs/forms/docker-input-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {
    OpenInputInspector,
    OpenExpressionEditor,
    CloseInputInspector,
    CloseExpressionEditor
} from "../../action-events/index";
import {CommandInputParameterModel as InputProperty, CommandLineToolModel} from "cwlts/lib/models/d2sb";
import {Observable} from "rxjs";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    directives: [
        DockerInputFormComponent,
        BaseCommandFormComponent,
        InputPortsFormComponent,
        CommandLineComponent,
        REACTIVE_FORM_DIRECTIVES,
        FORM_DIRECTIVES,
    ],
    animations: [
        trigger("formPosition", [
            state("left", style({})),
            state("center", style({})),
            transition("hidden => visible", animate("100ms ease-in")),
            transition("visible => hidden", animate("100ms ease-out"))
        ])
    ],
    template: `
            <form class="clt-editor-group"
                  [formGroup]="cltEditorGroup">
                <docker-input-form [@formPosition]="formPosition"
                                class="input-form" 
                                [group]="cltEditorGroup"
                                [cltModel]="model"
                                [dockerPull]="'some.docker.image.com'">
                </docker-input-form>
                                
                <base-command-form [@formPosition]="formPosition"
                                class="input-form" 
                                [group]="cltEditorGroup"
                                [baseCommand]="model.baseCommand">
                </base-command-form>
                
                <inputs-ports-form [@formPosition]="formPosition"
                                   [cltModel]="model"
                                   class="input-form">
                </inputs-ports-form>
            </form>
    `
})
export class CltEditorComponent implements OnInit {
    /** The file that we are going to use to list the properties */
    @Input()
    public fileStream: Observable<FileModel>;

    @Input()
    public toolInputs: Array<InputProperty>;

    @Input()
    private model: CommandLineToolModel;

    private file: FileModel;

    private toolInputPorts: BehaviorSubject<InputProperty[]> = new BehaviorSubject<InputProperty[]>([]);

    /** Positions of the listed properties */
    private formPosition: FormPosition = "center";

    /* TODO: generate the commandline */
    private commandlineContent: string;

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

    ngOnInit() {
        this.commandlineContent = this.model.getCommandLine();
    }
}
