import {Component, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-structure-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">Document Structure</span>
        </ct-panel-toolbar>
    `
})
export class StructurePanelComponent {


}