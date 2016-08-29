import {
    Component,
    Input,
    OnInit
} from "@angular/core";
import {NgSelectOption} from "@angular/common";
import {FileModel} from "../../../store/models/fs.models";
import {ToolValidator} from "../../../validators/tool.validator";
import {CwlValidationResult} from "../../../action-events/index";
import {EventHubService} from "../../../services/event-hub/event-hub.service";
import {ValidationResponse} from "../../../services/webWorker/json-schema/json-schema.service";
import {ViewModeService} from "../services/view-mode.service";

require("./tool-header.component.scss");

@Component({
    selector: "tool-header",
    directives: [NgSelectOption],
    providers: [ToolValidator],
    template: `
            <span class="gui-json-buttons">
                <button type="button"
                        class="btn btn-secondary btn-sm selected"
                        [ngClass]="{selected: viewMode === 'json'}"
                        (click)="changeViewMode('json')">JSON</button>

                <button type="button"
                        class="btn btn-secondary btn-sm"
                        [disabled]="!isValidTool"
                        [ngClass]="{selected: viewMode === 'gui'}"
                        (click)="changeViewMode('gui')">GUI</button>
            </span>
    
            <button type="button" class="btn btn-secondary btn-sm save-button">Save</button>
    `
})
export class ToolHeaderComponent implements OnInit{
    /** The current view mode is needed for styling the selected button */
    private viewMode: string;

    @Input()
    public file: FileModel;

    private isValidTool: boolean;
    
    private isSupportedFileFormat: boolean;

    constructor(private toolValidator: ToolValidator,
                private eventHubService: EventHubService,
                private viewModeService: ViewModeService) {

        this.viewModeService.viewMode.subscribe(viewMode => {
            this.viewMode = viewMode;
        });
    }

    ngOnInit(): void {
        this.isSupportedFileFormat = this.toolValidator.isSupportedFileFormat(this.file);

        this.eventHubService.onValueFrom(CwlValidationResult)
            .subscribe((validationResult: ValidationResponse) => {
                this.isValidTool = this.isSupportedFileFormat && validationResult.isValidCwl;
            });
    }

    private changeViewMode(viewMode: string): void {
        this.viewModeService.setViewMode(viewMode);
    }
}
