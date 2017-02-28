import {Component, ViewEncapsulation} from "@angular/core";
import {ComponentBase} from "../../../../components/common/component-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector-step",
    template: `
        Step tab
    `
})
export class WorkflowStepInspectorTabStep extends ComponentBase {
    constructor() {
        super();
    }
}
