import {PluginBase, Workflow, StepNode} from "cwl-svg";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {StepModel} from "cwlts/models";

export class UpdatePlugin extends PluginBase {

    private css       = {
        plugin: "__plugin-update",
        update: "__update-has-update"
    };
    private updateMap = new Map<string, boolean>();

    registerWorkflow(workflow: Workflow) {
        super.registerWorkflow(workflow);
        this.workflow.svgRoot.classList.add(this.css.plugin);
    }

    hasUpdate(step: StepModel): boolean {
        return this.updateMap.get(step.connectionId);
    }

    updateStep(step: StepModel) {
        const stepEl = this.findStep(step);
        stepEl.classList.remove(this.css.update);
        this.updateMap.set(step.connectionId, false);
        new StepNode(stepEl, step as any).update();
    }

    applyRevisionMap(appRevisionMap: { [appID: string]: number }): void {
        this.workflow.model.steps.forEach(step => {

            // a non-sbg app might be embedded in an sbg workflow
            if (!step.run || !step.run.customProps || !step.run.customProps["sbg:id"]) {
                return;
            }
            const revisionless = AppHelper.getAppIDWithRevision(step.run.customProps["sbg:id"], null);
            const revision     = AppHelper.getRevision(step.run.customProps["sbg:id"]);

            if (appRevisionMap[revisionless] === undefined) {
                return;
            }

            let hasUpdate = appRevisionMap[revisionless] > revision;
            this.updateMap.set(step.connectionId, hasUpdate);

            if (hasUpdate) {
                const stepEl = this.findStep(step as any);
                stepEl.classList.add(this.css.update);
            }
        });
    }

    private findStep(step: StepModel): SVGElement {
        return this.workflow.svgRoot.querySelector(`.step[data-connection-id="${step.connectionId}"]`) as SVGElement;
    }
}
