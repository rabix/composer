import {PluginBase, Workflow} from "cwl-svg";

export class SVGRequiredInputMarkup extends PluginBase {

    private svg: SVGGElement;

    private css = {
        plugin: "__plugin-required-input-markup",
        required: "__plugin-require-input-markup-required"
    };


    registerWorkflow(workflow: Workflow): void {

        super.registerWorkflow(workflow);
        this.svg = this.workflow.svgRoot;
        this.svg.classList.add(this.css.plugin);
    }

    destroy(): void {
        this.svg.classList.remove(this.css.plugin);
    }

    markMissing(...nodeIDs: string[]) {

        const allInputs = this.workflow.workflow.querySelectorAll(`.node.input`);

        for (const inputEl of allInputs) {
            const id = inputEl.getAttribute("data-connection-id");

            if (~nodeIDs.indexOf(id)) {
                inputEl.classList.add(this.css.required);
            } else {
                inputEl.classList.remove(this.css.required);
            }
        }
    }
}
