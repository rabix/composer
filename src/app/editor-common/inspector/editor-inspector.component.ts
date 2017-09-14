import {Component} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-editor-inspector",
    styleUrls: ["./editor-inspector.component.scss"],
    template: `
        <ng-content></ng-content>
    `
})
export class EditorInspectorComponent extends DirectiveBase {

}
