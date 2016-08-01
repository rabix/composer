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
            <select id="revisionSelect" name="rev" [ngModel]="selectedRevision" (change)="onRevisionChange($event)">
                <option *ngFor="let revision of revisions" [value]="revision">{{revision}}</option>
            </select>
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
    
    /** Tool revisions. TODO: load actual revisions */
    private revisions: Array<string> = ["rev1", "rev2", "rev3"];
    
    /** Currently selected revision */
    private selectedRevision: string = this.revisions[0];
    
    changeViewMode(viewMode: string) {
        this.viewModeChanged.emit(viewMode);
    }

    onRevisionChange(e): void {
        this.selectedRevision = e.target.value;
    }
}
