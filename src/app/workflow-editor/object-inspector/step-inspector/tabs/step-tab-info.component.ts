import {Component, Input, ViewEncapsulation} from "@angular/core";
import {StepModel} from "cwlts/models";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector-info",
    template: `
        <div>
            <!--Type-->
            <p>
                <strong>Type:</strong>
                <span> {{ step.run['class'] }} </span>
            </p>

            <!--Cwl Version-->
            <p>
                <strong>Cwl Version:</strong>
                <span> {{ step.run['cwlVersion'] }} </span>
            </p>

            <!--Revision-->
            <p>
                <strong>Revision:</strong>
                <span>{{ step.run.customProps['sbg:revision'] }}</span>
            </p>

            <!--Toolkit Version-->
            <p>
                <strong>Toolkit Version:</strong>
                <span>{{ step.run.customProps['sbg:toolkitVersion'] }}</span>
            </p>

            <!--Author-->
            <p>
                <strong>Author:</strong>
                <span> {{ step.run.customProps['sbg:createdBy'] }} </span>
            </p>

            <!--Author-->
            <p>
                <strong>Source:</strong>
                <span> {{ getSource() }} </span>
            </p>

            <!--Description-->
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

    getSource() {
        return this.step.customProps["sbg:rdfId"] ? (() => {
            const idSplit = this.step.customProps["sbg:rdfId"].split("/");
            idSplit.pop();
            return idSplit.join("/");
        })() : this.step.run.customProps["sbg:project"] || "Embedded";
    }

    getDescription() {
        return this.step.description || this.step.run ? this.step.run.description : "";
    }
}
