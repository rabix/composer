import {Component, ChangeDetectionStrategy} from "@angular/core";
import {TreeViewComponent} from "../tree-view/tree-view.component";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {PanelToolbarComponent} from "./panel-toolbar.component";

@Component({
    selector: "ct-revisions-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-panel-toolbar>
            <name>Document Revisions</name>
        </ct-panel-toolbar>
    `
})
export class RevisionsPanelComponent {

  

}