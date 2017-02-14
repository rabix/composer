import {Component} from "@angular/core";
import {ComponentBase} from "../../../../components/common/component-base";

@Component({
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
