import {Component, ChangeDetectionStrategy} from "@angular/core";

require("./editor-controls.component.scss");

@Component({
    selector: 'ct-editor-controls',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<ng-content></ng-content>`
})
export class EditorControlsComponent {

}
