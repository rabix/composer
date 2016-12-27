import {Component} from "@angular/core";
import {ComponentBase} from "../../components/common/component-base";

@Component({
    selector: "ct-editor-inspector",
    template: "<ng-content></ng-content>"
})
export class EditorInspectorComponent extends ComponentBase {


    private findScrollableParent(node) {
        if (node === null) {
            return null;
        }

        if (node.scrollHeight > node.clientHeight) {
            return node;
        }
        return this.findScrollableParent(node.parentNode);
    }

}