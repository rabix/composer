import {AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild} from "@angular/core";
import {FormControl} from "@angular/forms";
import {SelectionPlugin, SVGArrangePlugin, SVGEdgeHoverPlugin, SVGNodeMovePlugin, Workflow as WorkflowGraph, ZoomPlugin} from "cwl-svg";
import {StepModel} from "cwlts/models/generic/StepModel";
import {WorkflowInputParameterModel} from "cwlts/models/generic/WorkflowInputParameterModel";
import {WorkflowModel} from "cwlts/models/generic/WorkflowModel";
import {WorkflowOutputParameterModel} from "cwlts/models/generic/WorkflowOutputParameterModel";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {AppMetaManager} from "../../core/app-meta/app-meta-manager";
import {APP_META_MANAGER} from "../../core/app-meta/app-meta-manager-factory";
import {AppHelper} from "../../core/helpers/AppHelper";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {SVGJobFileDropPlugin} from "../../workflow-editor/svg-plugins/job-file-drop/job-file-drop";
import {SVGRequiredInputMarkup} from "../../workflow-editor/svg-plugins/required-input-markup/required-input-markup";
import {EditorInspectorService} from "../inspector/editor-inspector.service";

@Component({
    selector: "ct-graph-job-editor",
    templateUrl: "./graph-job-editor.component.html",
    styleUrls: ["./graph-job-editor.component.scss"]
})
export class GraphJobEditorComponent extends DirectiveBase implements OnInit, AfterViewInit {

    @Input()
    appID: string;

    @Input()
    model: WorkflowModel;

    @Output()
    draw = new EventEmitter<any>();

    inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;

    private graph: WorkflowGraph;

    private jobControl = new FormControl({});

    private inspectedInputs = [];

    constructor(private inspector: EditorInspectorService,
                @Inject(APP_META_MANAGER) private metaManager: AppMetaManager) {
        super();
    }

    onDrop(event, data: { name: string, type: "cwl" | "file" | "directory" }) {

        if (!AppHelper.isLocal(data.name)) {
            return;
        }

        let type = data.type === "directory" ? "Directory" : "File";

        const dropElement = event.ctData.preHoveredElement;
        const inputEl     = this.findParentInputOfType(dropElement, type);

        if (inputEl) {

            const inputID    = inputEl.getAttribute("data-id");
            const inputModel = this.model.inputs.find(input => input.id === inputID) as WorkflowInputParameterModel;

            const inputTypeIsArray = inputModel.type.type === "array";

            const job           = this.jobControl.value;
            const inputJobValue = job[inputID];

            const jobValueIsArray = Array.isArray(inputJobValue);

            const newEntry = {class: type, path: data.name};

            const patch = {[inputID]: newEntry} as any;

            if (jobValueIsArray) {
                patch[inputID] = inputJobValue.concat(newEntry);
            } else if (inputTypeIsArray) {
                patch[inputID] = [newEntry];
            } else {
                patch[inputID] = newEntry;
            }

            const newJob = {...job, ...patch};

            this.jobControl.patchValue(newJob);
        }
    }

    ngOnInit() {
    }

    ngAfterViewInit() {

        this.graph = new WorkflowGraph({
            svgRoot: this.canvas.nativeElement,
            model: this.model as any,
            plugins: [
                new SVGEdgeHoverPlugin(),
                new SelectionPlugin(),
                new ZoomPlugin(),
                new SVGNodeMovePlugin(),
                new SVGJobFileDropPlugin(),
                new SVGArrangePlugin(),
                new SVGRequiredInputMarkup()
            ]
        });

        this.graph.fitToViewport();
        this.draw.emit(this);

        this.jobControl.valueChanges
            .map(v => this.normalizeJob(v))
            .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            .subscribeTracked(this, changes => {

                this.graph.getPlugin(SVGJobFileDropPlugin).updateToJobState(changes);
                this.metaManager.patchAppMeta("job", changes);
            });

        this.metaManager.getAppMeta("job")
            .filter(v => v) // job might be empty if we havent modified anything yet
            .subscribeTracked(this, job => {
                const markupPlugin = this.graph.getPlugin(SVGRequiredInputMarkup);

                const missingInputConnectionIDs = this.model.inputs
                    .filter(input => !input.type.isNullable && (job[input.id] === null || job[input.id] === undefined))
                    .map(input => input.connectionId);

                markupPlugin.markMissing(...missingInputConnectionIDs);
            });

        this.metaManager.getAppMeta("job").take(1).subscribeTracked(this, storedJob => {
            this.updateJob(storedJob)
        });
    }

    private normalizeJob(jobObject: Object) {
        const nullJob = JobHelper.getNullJobInputs(this.model);

        const job = jobObject || {};

        for (const key in job) {
            if (!nullJob.hasOwnProperty(key)) {
                delete job[key];
            }
        }

        return {...nullJob, ...job};
    }


    updateJob(jobObject = {}) {

        const normalizedJob = this.normalizeJob(jobObject);
        const controlValue  = normalizedJob;

        this.jobControl.patchValue(controlValue, {emitEvent: false});

        this.graph.getPlugin(SVGJobFileDropPlugin).updateToJobState(controlValue);

        // If we modified the job, push the update back
        if (JSON.stringify(normalizedJob) !== JSON.stringify(jobObject)) {
            this.metaManager.patchAppMeta("job", normalizedJob);
        }
    }

    findParentInputOfType(el: Element, type: string) {
        while (el) {

            const isInput     = el.classList.contains("input");
            const isType      = el.classList.contains(`type-${type}`);
            const isArrayType = el.classList.contains(`type-array`) && el.classList.contains(`items-${type}`);

            if (isInput && (isType || isArrayType)) {
                return el;
            }

            el = el.parentElement;
        }

        return el;
    }

    openInspector(ev: Event) {
        let current = ev.target as Element;

        // Check if clicked element is a node or any descendant of a node (in order to open object inspector if so)
        while (current !== this.canvas.nativeElement) {
            if (current.classList.contains("node")) {
                this.openNodeInInspector(current);
                break;
            }
            current = current.parentNode as Element;
        }
    }

    /**
     * Returns type of inspected node to determine which template to render for object inspector
     */
    typeOfInspectedNode() {
        if (this.inspectedNode instanceof StepModel) {
            return "Step";
        } else if (this.inspectedNode instanceof WorkflowInputParameterModel) {
            return "Input";
        } else {
            return "Output";
        }
    }

    /**
     * Open node in object inspector
     */
    private openNodeInInspector(node: Element) {

        let typeOfNode = "steps";

        if (node.classList.contains("input")) {
            typeOfNode = "inputs";
        } else if (node.classList.contains("output")) {
            typeOfNode = "outputs";
        } else {

        }

        this.inspectedNode = this.model[typeOfNode].find((input) => input.id === node.getAttribute("data-id"));
        switch (typeOfNode) {
            case "inputs":
                this.inspectedInputs = [this.inspectedNode];
                break;
            case "outputs":
                this.inspectedInputs = [];
                break;

            default:
                this.inspectedInputs = (this.inspectedNode as StepModel).in.filter(n => n.status === "exposed");
                break;
        }


        this.inspector.show(this.inspectorTemplate, this.inspectedNode.id);
    }

    inspectStep(nodeID: string) {
        const el = this.graph.svgRoot.querySelector(`[data-connection-id="${nodeID}"]`);
        if (el) {
            this.openNodeInInspector(el);
        }


        const selectionPlugin = this.graph.getPlugin(SelectionPlugin);
        if (selectionPlugin) {
            selectionPlugin.selectStep(nodeID);
        }
    }


    ngOnDestroy(): void {
        super.ngOnDestroy();

        if (this.graph) {
            this.graph.destroy();
        }
        this.inspector.hide();
    }

}
