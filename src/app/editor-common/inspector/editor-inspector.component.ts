import {Component, ViewEncapsulation} from "@angular/core";
import {ComponentBase} from "../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-editor-inspector",
    template: "<ng-content></ng-content>"
})
export class EditorInspectorComponent extends ComponentBase {

}
