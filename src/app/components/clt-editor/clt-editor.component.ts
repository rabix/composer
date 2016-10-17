import {Component, Input} from "@angular/core";
import {FormBuilder, FormGroup, REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES} from "@angular/forms";
import {FileModel} from "../../store/models/fs.models";
import {CommandLineComponent} from "./commandline/commandline.component";
import {DockerInputFormComponent} from "../forms/inputs/forms/docker-input-form.component";
import {BaseCommandFormComponent} from "../forms/inputs/forms/base-command-form.component";
import {InputPortsFormComponent} from "../forms/inputs/forms/input-ports-form.component";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {
    OpenInputInspector,
    OpenExpressionEditor,
    CloseInputInspector,
    CloseExpressionEditor
} from "../../action-events";
import {CommandInputParameterModel as InputProperty, CommandLineToolModel} from "cwlts/models/d2sb";
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
    template: `
            <form class="clt-editor-group"
                  [formGroup]="cltEditorGroup">
                <docker-input-form [group]="cltEditorGroup"
                                [cltModel]="model"
                                [dockerPull]="'some.docker.image.com'">
                </docker-input-form>
                                
                <base-command-form [toolBaseCommand]="model.baseCommand"
                                [baseCommandForm]="cltEditorGroup.controls.baseCommandGroup">
                </base-command-form>
                
                <inputs-ports-form [cltModel]="model">
                </inputs-ports-form>
            </form>
    `
})
export class CltEditorComponent {
    /** The file that we are going to use to list the properties */
    @Input()
    public fileStream: Observable<FileModel>;

    @Input()
    private model: CommandLineToolModel;

    private file: FileModel;

    /* TODO: generate the commandline */
    private commandlineContent: string;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    private cltEditorGroup: FormGroup;

    private closeSidebarActions = [];

    constructor(private formBuilder: FormBuilder,
                private eventHubService: EventHubService) {

        /* Opening the sidebar */
        this.eventHubService.on(OpenInputInspector).subscribe(() => {
            this.closeSidebarActions.push(CloseInputInspector);
        });

        this.eventHubService.on(OpenExpressionEditor).subscribe(() => {
            this.closeSidebarActions.push(CloseExpressionEditor);
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
    }

    ngOnInit() {
        this.fileStream.first(file => {
            this.file = file;
            return true;
        });

        this.cltEditorGroup = this.formBuilder.group({
            dockerInputGroup: this.formBuilder.group({}),
            baseCommandGroup: this.formBuilder.group({}),
            inputPortsGroup: this.formBuilder.group({})
        });
    }
}
