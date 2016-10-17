import {Component, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-revisions-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <name>App Revisions</name>
        </ct-panel-toolbar>
    `
})
export class RevisionsPanelComponent {

  

}