import {Component, ViewEncapsulation} from "@angular/core";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-editor-inspector",
    template: "<ng-content></ng-content>"
})
export class EditorInspectorComponent extends DirectiveBase {

}
