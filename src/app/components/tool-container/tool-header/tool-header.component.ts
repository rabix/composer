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
        <header>
                <span id="guiJsonButtons">
                    <button type="button"
                            class="btn btn-secondary btn-sm selected"
                            [ngClass]="{selected: viewMode === 'json'}"
                            (click)="changeViewMode('json')">JSON</button>

                    <button type="button"
                            class="btn btn-secondary btn-sm"
                            [ngClass]="{selected: viewMode === 'gui'}"
                            (click)="changeViewMode('gui')">GUI</button>
                </span>
    
            <button id="saveButton" type="button" class="btn btn-secondary btn-sm">Save</button>
        </header>
    `
})
export class ToolHeaderComponent {
    /** The current view mode is needed for styling the selected button */
    @Input()
    private viewMode: ViewMode;

    /** Emit changes of the view mode */
    @Output()
    private viewModeChanged = new EventEmitter();

    changeViewMode(viewMode: string) {
        this.viewModeChanged.emit(viewMode);
    }
}
