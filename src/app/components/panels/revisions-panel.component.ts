import {Component, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-revisions-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <span class="tc-name">App Revisions</span>
        </ct-panel-toolbar>
    `
})
export class RevisionsPanelComponent {

  

}