import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {StepModel, WorkflowInputParameterModel, WorkflowModel, WorkflowOutputParameterModel} from "cwlts/models";
import {Workflow} from "cwl-svg";
import {StatusBarService} from "../../../core/status-bar/status-bar.service";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {Observable} from "rxjs";
import * as Yaml from "js-yaml";
import LoadOptions = jsyaml.LoadOptions;
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";


declare const Snap: any;

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "ct-workflow-graph-editor",
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ["./workflow-graph-editor.component.scss"],
    template: `
        <svg (dblclick)="openInspector($event)" #canvas class="cwl-workflow"
             [ct-drop-enabled]="true"
             [ct-drop-zones]="['zone1']"
             (onDropSuccess)="onDrop($event.detail.data.event, $event.detail.data.transfer_data)"></svg>

        <template #controls>
            
            <span class="btn-group">
                    <button class="btn btn-sm btn-secondary" (click)="downscale()">-</button>
                    <button class="btn btn-sm btn-secondary"
                            (click)="graph.command('workflow.fit')">Fit to Viewport</button>
                    <button class="btn btn-sm btn-secondary" (click)="upscale()">+</button>
                
                </span>

        </template>

        <!--Inspector Template -->
        <template #inspector>
            <ct-editor-inspector-content>
                <div class="tc-header">
                    <ct-tree-node-icon *ngIf="inspectedNode.run" [type]="inspectedNode.run?.class"
                                       class="align-icon-height"></ct-tree-node-icon>
                    {{ inspectedNode.label || inspectedNode.id || inspectedNode.loc || typeOfInspectedNode()}}
                </div>
                <div class="tc-body">
                    <ct-workflow-step-inspector *ngIf="typeOfInspectedNode() === 'Step'"
                                                [step]="inspectedNode"
                                                [graph]="graph"
                                                [workflowModel]="model">
                    </ct-workflow-step-inspector>

                    <ct-workflow-io-inspector
                        *ngIf="typeOfInspectedNode() === 'Input' || typeOfInspectedNode() === 'Output'"
                        [port]="inspectedNode"
                        [graph]="graph"
                        [workflowModel]="model">

                    </ct-workflow-io-inspector>

                </div>
            </ct-editor-inspector-content>
        </template>
    `
})
export class WorkflowGraphEditorComponent extends ComponentBase {

    @Input()
    public model: WorkflowModel;

    @Input()
    public readonly = false;

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("controls")
    private controlsTemplate: TemplateRef<any>;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;

    private inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    public graph: Workflow;

    constructor(private statusBar: StatusBarService,
                private inspector: EditorInspectorService) {
        super();
    }

    ngOnInit() {
        const removeHandler = (node) => {
            if (node === this.inspectedNode) {
                this.inspector.hide();
            }
        };

        this.tracked = this.model.on("output.remove", removeHandler);
        this.tracked = this.model.on("input.remove", removeHandler);
        this.tracked = this.model.on("step.remove", removeHandler);
    }

    ngOnChanges() {
        this.graph = new Workflow(new Snap(this.canvas.nativeElement), this.model);
        this.graph.command("workflow.fit");
        this.statusBar.setControls(this.controlsTemplate);
    }

    private upscale() {
        this.graph.command("workflow.scale", this.graph.getScale() + .1);
    }

    private downscale() {
        if (this.graph.getScale() > .1) {
            this.graph.command("workflow.scale", this.graph.getScale() - .1);

        }
    }

    /**
     * Triggers when app is dropped on canvas
     */
    private onDrop(ev: MouseEvent, node: { content: Observable<string> }) {
        node.content.first().subscribe((node) => {
            try {
                let json = Yaml.safeLoad(node, {
                    json: true,
                    onWarning: noop
                } as LoadOptions);


                const step = this.model.addStepFromProcess(json);
                const coords = this.graph.translateMouseCoords(ev.clientX, ev.clientY);
                Object.assign(step.customProps, {
                    "sbg:x": coords.x,
                    "sbg:y": coords.y
                });

                this.graph.command("app.create.step", step);
            } catch (ex) {
                console.warn(ex);
            }

        });
    }

    /**
     * Triggers when click events occurs on canvas
     */
    openInspector(ev: Event) {
        let current = ev.target as Element;

        // Check if clicked element is a node or any descendant of a node (in order to open object inspector if so)
        while (current != this.canvas.nativeElement) {
            if (this.hasClassSvgElement(current, "node")) {
                this.openNodeInInspector(current);
                break;
            }
            current = current.parentNode as Element;
        }
    }

    /**
     * Returns type of inspected node to determine which template to render for object inspector
     */
    private typeOfInspectedNode() {
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

        if (this.hasClassSvgElement(node, "input")) {
            typeOfNode = "inputs";
        } else if (this.hasClassSvgElement(node, "output")) {
            typeOfNode = "outputs";
        }

        this.inspectedNode = this.model[typeOfNode].find((input) => input.id === node.getAttribute("data-id"));
        this.inspector.show(this.inspectorTemplate, this.inspectedNode.id);
    }

    /**
     * IE does not support classList property for old browsers and also SVG elements
     */
    private hasClassSvgElement(element: Element, className: string) {
        const elementClass = element.getAttribute("class") || "";
        return elementClass.split(" ").indexOf(className) > -1;
    }

    ngOnDestroy() {
        this.inspector.hide();
    }
}
