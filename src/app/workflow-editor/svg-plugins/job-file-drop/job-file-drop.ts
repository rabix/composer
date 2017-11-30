import {PluginBase, Workflow} from "cwl-svg";
import {AppHelper} from "../../../core/helpers/AppHelper";

export class SVGJobFileDropPlugin extends PluginBase {

    private svg: SVGGElement;

    private fileInputs: {
        [id: string]: {
            type: "File" | "array",
            element: SVGElement
        }
    } = {};

    private css = {
        plugin: "__plugin-job-file-drop",
        added: "__plugin-job-file-drop-added"
    };


    registerWorkflow(workflow: Workflow): void {
        super.registerWorkflow(workflow);

        this.svg = this.workflow.svgRoot;

        this.svg.classList.add(this.css.plugin);
    }

    destroy(): void {
        this.svg.classList.remove(this.css.plugin);
    }

    afterRender(): void {
        this.replaceNodeNames();
    }

    replaceNodeNames() {
        const fileInputLabels = this.workflow.workflow.querySelectorAll(".input.type-File .title.label");
        for (const lb of fileInputLabels) {

            lb.textContent = "No file added";
        }

        const fileArrayInputLabels = this.workflow.workflow.querySelectorAll(".input.type-array.items-File  .title.label");
        for (const lb of fileArrayInputLabels) {
            lb.textContent = "No files added";
        }

    }

    updateToJobState(job = {}) {

        const fileInputsSelector      = ".input.type-File";
        const fileArrayInputsSelector = ".input.type-array.items-File";

        // Find all input nodes that represent files or file arrays
        const query = this.svg.querySelectorAll([fileInputsSelector, fileArrayInputsSelector].join()) as NodeListOf<SVGGElement>;

        for (let node of query) {

            const inputID = node.getAttribute("data-id");

            if (!job[inputID]) {
                this.updateNodeLabel(node, []);
                continue;
            }

            const filePaths = [];
            for (const entry of [].concat(job[inputID])) {
                if (entry.class === "File" && entry.path) {
                    filePaths.push(entry.path);
                }
            }

            this.updateNodeLabel(node, filePaths);
        }
    }

    private updateNodeLabel(node: SVGGElement, paths: string[] = []): void {
        const label   = node.querySelector(`.title.label`);
        const isArray = node.classList.contains("type-array");


        if (node && label) {

            if (paths.length > 1) {
                label.textContent = `Added ${paths.length} files`;
            } else if (paths.length === 1) {
                label.textContent = AppHelper.getBasename(paths[0]);
            } else if (isArray) {
                label.textContent = "No files added"
            } else {
                label.textContent = "No file added"
            }
        }
    }
}
