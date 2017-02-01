import {Component, Input, Output} from "@angular/core";
import {WorkflowOutputParameterModel} from "cwlts/models";
import {Subject} from "rxjs";

@Component({
    selector: "ct-workflow-output-inspector",
    template: `
        <div>
            <!--REMOVE ME-->
            <pre>{{ output | json }}</pre>
        </div>`
})
export class WorkflowOutputInspector {
    @Input()
    public output: WorkflowOutputParameterModel;

    @Output()
    public save = new Subject<WorkflowOutputParameterModel>();
}