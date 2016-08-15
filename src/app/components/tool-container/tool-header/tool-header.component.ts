import {
    Component,
    EventEmitter,
    Input,
    Output,
    OnInit
} from "@angular/core";
import {NgSelectOption} from "@angular/common";
import {ViewMode} from "../tool-container.component";
import {FileModel} from "../../../store/models/fs.models";
import {ToolValidator} from "../../../validators/tool.validator";

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
    @Input()
    private viewMode: ViewMode;

    @Input()
    private file: FileModel;

    private isValidTool: boolean;

    /** Emit changes of the view mode */
    @Output()
    private viewModeChanged = new EventEmitter();

    constructor(private toolValidator: ToolValidator) { }

    ngOnInit(): void {
        this.isValidTool = this.toolValidator.isSupportedFileFormat(this.file);
    }

    changeViewMode(viewMode: string): void {
        this.viewModeChanged.emit(viewMode);
    }
}
