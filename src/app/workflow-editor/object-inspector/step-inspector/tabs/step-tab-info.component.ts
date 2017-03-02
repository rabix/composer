import {Component, Input, ViewEncapsulation} from "@angular/core";
import {StepModel} from "cwlts/models";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector-info",
    template: `
        <div>
            <p>
                <strong>Type:</strong>
                <span> {{ step.run['class'] }} </span>
            </p>
            <p>
                <strong>Revision:</strong>
                <span>{{ step.run.customProps['sbg:revision'] }}</span>
            </p>
            <p>
                <strong>Toolkit Version:</strong>
                <span>{{ step.run.customProps['sbg:toolkitVersion'] }}</span>
            </p>
            <p>
                <strong>Author:</strong>
                <span> {{ step.run.customProps['sbg:createdBy'] }} </span>
            </p>
        
            <div>
                <strong>Description{{ getDescription() ? '' : ':'}}</strong>
                <div class="form-group" [ngClass]="{'format': getDescription()}">
                    <div [ct-markdown]="getDescription()"></div>
                </div>
            </div>
        </div>        
    `
})
export class WorkflowStepInspectorTabInfo {
    @Input()
    public step: StepModel;

    private getDescription() {
        return this.step.description || this.step.description;
    }
}
