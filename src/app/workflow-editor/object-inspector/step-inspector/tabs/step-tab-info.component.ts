import {Component, Input} from "@angular/core";
import {StepModel} from "cwlts/models";
import {AppHelper} from "../../../../core/helpers/AppHelper";

@Component({
    styleUrls: ["step-tab-info.component.scss"],
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
                    <ct-markdown [value]="getDescription()"></ct-markdown>
                </div>
            </div>
        </div>
    `
})
export class WorkflowStepInspectorTabInfo {
    @Input()
    step: StepModel;

    getSource() {

        const rdfID = this.step.customProps["sbg:rdfId"];
        if (rdfID) {
            return AppHelper.getDirname(rdfID);
        }

        return this.step.run.customProps["sbg:project"] || "Embedded";
    }

    getDescription() {
        return this.step.description || this.step.run ? this.step.run.description : "";
    }
}
