import {ChangeDetectionStrategy, Component, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-editor-controls",
    styleUrls: ["./editor-controls.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-content></ng-content>`
})
export class EditorControlsComponent {

}
