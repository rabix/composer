import {Component, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-structure-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <name>Document Structure</name>
        </ct-panel-toolbar>
    `
})
export class StructurePanelComponent {


}