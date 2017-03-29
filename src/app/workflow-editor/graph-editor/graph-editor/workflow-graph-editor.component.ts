import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Workflow} from "cwl-svg";
import {
    StepModel,
    WorkflowFactory,
    WorkflowInputParameterModel,
    WorkflowModel,
    WorkflowOutputParameterModel
} from "cwlts/models";
import {DataGatewayService} from "../../../core/data-gateway/data-gateway.service";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import LoadOptions = jsyaml.LoadOptions;
import {IpcService} from "../../../services/ipc.service";
import {WorkflowEditorService} from "../../workflow-editor.service";


declare const Snap: any;

@Component({
    selector: "ct-workflow-graph-editor",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./workflow-graph-editor.component.scss"],
    template: `
        <svg (dblclick)="openInspector($event)" #canvas class="cwl-workflow" tabindex="-1"
             [ct-drop-enabled]="true"
             [ct-drop-zones]="['zone1']"
             (onDropSuccess)="onDrop($event.detail.data.event, $event.detail.data.transfer_data)"></svg>

        <ng-template #controls>
            
            <span class="btn-group">
                    <button class="btn btn-sm btn-secondary" (click)="downscale()">-</button>
                    <button class="btn btn-sm btn-secondary"
                            (click)="graph.command('workflow.fit')">Fit to Viewport</button>
                    <button class="btn btn-sm btn-secondary" (click)="upscale()">+</button>
                
                </span>

        </ng-template>

        <!--Inspector Template -->
        <ng-template #inspector>
            <ct-editor-inspector-content>
                <div class="tc-header">
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
        </ng-template>
    `
})
export class WorkflowGraphEditorComponent extends DirectiveBase implements OnChanges, OnInit, OnDestroy, AfterViewInit {

    @Input()
    public model: WorkflowModel;

    @Input()
    public readonly = false;

    @Output()
    public modelChange = new EventEmitter();

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("controls")
    private controlsTemplate: TemplateRef<any>;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;

    inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    public graph: Workflow;

    private historyHandler: (ev: KeyboardEvent) => void;

    constructor(private statusBar: StatusBarService,
                private gateway: DataGatewayService,
                private ipc: IpcService,
                private inspector: EditorInspectorService,
                private workflowEditorService: WorkflowEditorService) {
        super();
    }

    ngOnInit() {
        const removeHandler = (node) => {
            if (node === this.inspectedNode) {
                this.inspector.hide();
                this.inspectedNode = null;
            }
        };

        this.tracked = this.model.on("output.remove", removeHandler);
        this.tracked = this.model.on("input.remove", removeHandler);
        this.tracked = this.model.on("step.remove", removeHandler);
    }

    private canvasIsInFocus() {
        const el = this.canvas.nativeElement;
        return el.getClientRects().length > 0 && (document.activeElement === el || el.contains(document.activeElement));
    }

    ngAfterViewInit() {

        this.graph = new Workflow(new Snap(this.canvas.nativeElement), this.model as any);
        this.graph.command("workflow.fit");

        this.graph.on("beforeChange", () => {
            this.workflowEditorService.putInHistory(this.model);
        });

        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+Z")
            .filter(() => this.canvasIsInFocus() && this.workflowEditorService.canUndo())
            .subscribe(() => {
                this.model = WorkflowFactory.from(this.workflowEditorService.historyUndo(this.model));

                // Resets the reference of inspected node (reference is lost after model serialization)
                this.resetInspectedNodeReference();

                this.modelChange.next(this.model);
                this.graph.redraw(this.model as any);
            });

        this.tracked = this.ipc.watch("accelerator", "Shift+CmdOrCtrl+Z")
            .filter(() => this.canvasIsInFocus() && this.workflowEditorService.canRedo())
            .subscribe(() => {
                this.model = WorkflowFactory.from(this.workflowEditorService.historyRedo(this.model));

                // Resets the reference of inspected node (reference is lost after model serialization)
                this.resetInspectedNodeReference();

                this.modelChange.next(this.model);
                this.graph.redraw(this.model as any);
            });
    }

    /**
     * If inspector is open, set reference of inspected node to a new one
     */
    resetInspectedNodeReference() {
        if (this.inspectedNode) {
            const connectionId = this.inspectedNode.connectionId;

            const step = this.model.steps.find((step) => connectionId === step.connectionId);
            const input = this.model.inputs.find((input) => connectionId === input.connectionId);
            const output = this.model.outputs.find((output) => connectionId === output.connectionId);
            this.inspectedNode = step || input || output;
        }
    }

    ngOnChanges() {
        if (this.graph) {
            this.graph.redraw();
        }
        // if (firstAnything && firstAnything.customProps["sbg:x"] === undefined) {
        //     console.log("Should arrange");
        //     // this.graph.command("workflow.arrange");
        // }


        // this.statusBar.setControls(this.controlsTemplate);
    }

    upscale() {
        this.graph.command("workflow.scale", this.graph.getScale() + .1);
    }

    downscale() {
        if (this.graph.getScale() > .1) {
            this.graph.command("workflow.scale", this.graph.getScale() - .1);

        }
    }

    /**
     * Triggers when app is dropped on canvas
     */
    onDrop(ev: MouseEvent, nodeID: string) {
        console.log("Dropped!", nodeID);

        this.gateway.fetchFileContent(nodeID, true).subscribe((app: any) => {

            const step = this.model.addStepFromProcess(app);
            console.log("adding step", step);
            const coords = this.graph.translateMouseCoords(ev.clientX, ev.clientY);
            Object.assign(step.customProps, {
                "sbg:x": coords.x,
                "sbg:y": coords.y
            });

            this.graph.command("app.create.step", step);
        }, err => {
            console.warn("Could not add an app", err);
        });
    }

    /**
     * Triggers when click events occurs on canvas
     */
    openInspector(ev: Event) {
        let current = ev.target as Element;

        // Check if clicked element is a node or any descendant of a node (in order to open object inspector if so)
        while (current !== this.canvas.nativeElement) {
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
        window.removeEventListener("keypress", this.historyHandler);
        this.inspector.hide();
    }

}
