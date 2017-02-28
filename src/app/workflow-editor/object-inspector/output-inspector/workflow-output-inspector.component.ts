import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {WorkflowOutputParameterModel} from "cwlts/models";
import {Subject} from "rxjs";

@Component({
    encapsulation: ViewEncapsulation.None,

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
