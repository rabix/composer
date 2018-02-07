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
        this.renderNodeLabels();
    }

    renderNodeLabels() {
        const fileInputNodeLabels = this.workflow.workflow.querySelectorAll(".input.type-File .title.label");
        for (const txtEl of fileInputNodeLabels) {
            this.createLabelTSpanElements(<SVGTextElement>txtEl);
        }

        const arrayFileInputNodeLabels = this.workflow.workflow.querySelectorAll(".input.type-array.items-File .title.label");
        for (const txtEl of arrayFileInputNodeLabels) {
            this.createLabelTSpanElements(<SVGTextElement>txtEl);
        }
    }

    createLabelTSpanElements(txtEl: SVGTextElement) {
        const idText      = txtEl.textContent;
        txtEl.textContent = "";

        const id = document.createElementNS(this.svg.namespaceURI, "tspan");
        id.setAttribute("x", "0");
        id.textContent = idText;
        txtEl.appendChild(id);

        const fileLabel = document.createElementNS(this.svg.namespaceURI, "tspan");
        fileLabel.classList.add("file-label");
        fileLabel.setAttribute("x", "0");
        fileLabel.setAttribute("dy", "15");
        fileLabel.textContent = "No file added";
        txtEl.appendChild(fileLabel);
    }

    updateToJobState(job = {}) {

        const fileInputsSelector      = ".input.type-File";
        const fileArrayInputsSelector = ".input.type-array.items-File";

        // Find all input nodes that represent files or file arrays
        const query = this.svg.querySelectorAll([fileInputsSelector, fileArrayInputsSelector].join()) as NodeListOf<SVGGElement>;

        for (const node of query) {

            const inputID = node.getAttribute("data-id");

            if (!job[inputID]) {
                this.updateNodeLabel(node, undefined);
                continue;
            }

            const filePaths = [];

            for (const entry of [].concat(job[inputID])) {

                if (entry === null) {
                    continue;
                }

                if (entry.class === "File" && entry.path) {
                    filePaths.push(entry.path);
                }
            }

            this.updateNodeLabel(node, filePaths);
        }
    }

    private updateNodeLabel(node: SVGGElement, values: string[] | undefined): void {
        const label       = node.querySelector(`.title .file-label`);
        const typeIsArray = node.classList.contains("type-array");

        if (!node || !label) {
            return;
        }

        if (values) {
            if (values.length > 1) {
                label.textContent = `Added ${values.length} files`;
            } else if (values.length === 1) {
                label.textContent = AppHelper.getBasename(values[0]);
            } else if (values.length === 0 && typeIsArray) {
                label.textContent = "Empty array";
            } else {
                label.textContent = "No file added";
            }
        } else if (typeIsArray) {
            label.textContent = "No files added";
        } else {
            label.textContent = "No file added";
        }
    }
}
