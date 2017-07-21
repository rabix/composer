import {Component, Input, ViewEncapsulation} from "@angular/core";
import {StepModel} from "cwlts/models";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-step-inspector-info",
    template: `
        <div>
            <!--Type-->
            <p>
                <span class="text-title">Type:</span>
                <span> {{ step.run['class'] }} </span>
            </p>

            <!--Cwl Version-->
            <p>
                <span class="text-title">Cwl Version:</span>
                <span> {{ step.run['cwlVersion'] }} </span>
            </p>

            <!--Revision-->
            <p>
                <span class="text-title">Revision:</span>
                <span>{{ step.run.customProps['sbg:revision'] }}</span>
            </p>

            <!--Toolkit Version-->
            <p>
                <span class="text-title">Toolkit:</span>
                <span>{{ step.run.customProps['sbg:toolkit'] }} {{step.run.customProps['sbg:toolkitVersion']}}</span>
            </p>

            <!--Author-->
            <p>
                <span class="text-title">Author:</span>
                <span> {{ step.run.customProps['sbg:createdBy'] }} </span>
            </p>

            <!--Author-->
            <p>
                <span class="text-title">Source:</span>
                <span> {{ getSource() }} </span>
            </p>

            <!--Description-->
            <div>
                <span class="text-title">Description{{ getDescription() ? '' : ':'}}</span>
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
