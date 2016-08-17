import {
    Component,
    EventEmitter,
    Input,
    Output
} from "@angular/core";
import {NgSelectOption} from "@angular/common";
import {ViewMode} from "../tool-container.component";

require("./tool-header.component.scss");

@Component({
    selector: "tool-header",
    directives: [NgSelectOption],
    template: `
            <span class="gui-json-buttons">
                <button type="button"
                        class="btn btn-secondary btn-sm selected"
                        [ngClass]="{selected: viewMode === 'json'}"
                        (click)="changeViewMode('json')">JSON</button>

                <button type="button"
                        class="btn btn-secondary btn-sm"
                        [ngClass]="{selected: viewMode === 'gui'}"
                        (click)="changeViewMode('gui')">GUI</button>
            </span>
    
            <button type="button" class="btn btn-secondary btn-sm save-button">Save</button>
    `
})
export class ToolHeaderComponent {
    /** The current view mode is needed for styling the selected button */
    @Input()
    public viewMode: ViewMode;

    /** Emit changes of the view mode */
    @Output()
    public viewModeChanged = new EventEmitter();

    private changeViewMode(viewMode: string) {
        this.viewModeChanged.emit(viewMode);
    }
}
