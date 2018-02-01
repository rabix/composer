import {PluginBase, Workflow} from "cwl-svg";
import {TemplateParser} from "cwl-svg/compiled/src/graph/template-parser";

export type NodeProgressState = "started" | "completed" | "failed";

export class SVGExecutionProgressPlugin extends PluginBase {

    private svg: SVGGElement;

    private pulsingNode: {
        stepID: string,
        state: NodeProgressState
    };

    private css = {
        plugin: "__plugin-execution-progress",
        started: "__plugin-execution-progress-started",
        failed: "__plugin-execution-progress-failed",
        completed: "__plugin-execution-progress-completed"
    };


    registerWorkflow(workflow: Workflow): void {

        super.registerWorkflow(workflow);
        this.svg = this.workflow.svgRoot;
        this.svg.classList.add(this.css.plugin);
    }


    afterRender(): void {

        if (this.pulsingNode) {
            const {stepID, state} = this.pulsingNode;
            this.setState(stepID, state);
        }

    }

    destroy(): void {
        this.svg.classList.remove(this.css.plugin);
        this.pulsingNode = undefined;
    }

    setAllStates(stepStates: { [stepID: string]: NodeProgressState } = {}): void {

        // If there are no step states, drawing should be brought back to pristine condition
        if (Object.keys(stepStates).length === 0) {
            return this.reset();
        }

        // If there are states, we should update the drawing to match them
        for (const stepID in stepStates) {
            this.setState(stepID, stepStates[stepID]);
        }

    }

    setState(stepID: string, state: NodeProgressState) {

        const node = this.svg.querySelector(`.node[data-id="${stepID}"] .core`);
        if (!node) {
            return;
        }

        const outerNode   = node.querySelector(".outer");
        const existingPulse = node.querySelector(".execution-progress-pulse");

        let pulse: SVGGElement;

        if (existingPulse) {
            const parentNode         = this.workflow.findParent(existingPulse);
            const sameElementPulsing = parentNode.getAttribute("data-id") === stepID;
            const sameTypeOfPulse    = parentNode.getAttribute("data-state") === state;

            if (sameElementPulsing) {
                pulse = existingPulse as SVGGElement;

                if (!sameTypeOfPulse) {
                    pulse.classList.remove(pulse.getAttribute("data-state"));
                    pulse.classList.add(state);
                    pulse.setAttribute("data-state", state);
                }

            } else {
                existingPulse.parentNode.removeChild(existingPulse);
            }
        }

        if (!pulse) {
            pulse = this.createPulse(state, outerNode.getAttribute("r") as any);
            node.insertBefore(pulse, node.firstChild);
        }

    }

    fail() {
        const pulsingNode = this.svg.querySelector(".execution-progress-pulse");
        if (pulsingNode) {
            const state = pulsingNode.getAttribute("data-state");
            pulsingNode.classList.remove(state);
            pulsingNode.classList.add("failed");

        }
    }

    private createPulse(state: string, radius = 20): SVGGElement {

        // language=SVG
        return TemplateParser.parse(`
            <g class="execution-progress-pulse ${state}" data-state="state">
                <circle class="circle first-circle" r="${radius}"></circle>
                <circle class="circle second-circle" r="${radius}"></circle>
                <circle class="circle third-circle" r="${radius}"></circle>
                <circle class="circle" r="${radius}"></circle>
            </g>
        `) as SVGGElement;

    }

    reset() {

        for (const el of this.svg.querySelectorAll(".execution-progress-pulse")) {
            el.parentNode.removeChild(el);
        }
        this.pulsingNode = undefined;
    }
}
