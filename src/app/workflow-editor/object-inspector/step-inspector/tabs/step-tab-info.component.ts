import {Component, ViewEncapsulation} from "@angular/core";
import {ComponentBase} from "../../../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector-info",
    template: `
        Info tab
    `
})
export class WorkflowStepInspectorTabInfo extends ComponentBase {
    constructor() {
        super();
    }
}
