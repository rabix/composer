import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {Workflow} from "cwl-svg";
import {StepModel, WorkflowFactory, WorkflowInputParameterModel, WorkflowModel, WorkflowOutputParameterModel} from "cwlts/models";
import {DataGatewayService} from "../../../core/data-gateway/data-gateway.service";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {IpcService} from "../../../services/ipc.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {WorkflowEditorService} from "../../workflow-editor.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {HintsModalComponent} from "../../../core/modals/hints-modal/hints-modal.component";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";


@Component({
    selector: "ct-workflow-graph-editor",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./workflow-graph-editor.component.scss"],
    template: `
        <div *ngIf="model && model.steps.length === 0" class="svg-graph-empty-state"></div>
        
        <svg (dblclick)="openInspector($event)"
             ct-click
             (onMouseClick)="setFocusOnCanvas()" #canvas class="cwl-workflow" tabindex="-1"
             [ct-drop-enabled]="true"
             [ct-drop-zones]="['zone1']"
             (onDropSuccess)="onDrop($event.detail.data.event, $event.detail.data.transfer_data)"></svg>

        <span class="svg-btns" (click)="setFocusOnCanvas()">
            
            <!--Delete button-->
            <span class="btn-group">
                <button *ngIf="selectedElement"
                        ct-tooltip="Delete"
                        tooltipPlacement="top"
                        class="btn btn-sm btn-secondary"
                        (click)="deleteSelectedElement()"
                        [disabled]="readonly">
                    <i class="fa fa-trash"></i>
                </button>
            </span>

            <!--Auto-arrange button-->
            <span class="btn-group">
                <button class="btn btn-sm btn-secondary"
                        ct-tooltip="Auto-arrange"
                        tooltipPlacement="top"
                        (click)="arrange()"
                        [disabled]="readonly">
                    <i class="fa fa-paint-brush"></i>
                </button>
            </span>

            <!--Hints button-->
            <span class="btn-group">
                <button ct-tooltip="Hints"
                        tooltipPlacement="top"
                        class="btn btn-sm btn-secondary"
                        (click)="setHints()">
                    <i class="fa fa-ellipsis-h"></i>
                </button>
            </span>
            
            <span class="btn-group">
                
                <!--Zoom in button-->
                <button class="btn btn-sm btn-secondary"
                        (click)="upscale()"
                        ct-tooltip="Zoom In"
                        tooltipPlacement="top"
                        [disabled]="graph !== undefined && graph.getScale() >= 2">
                    <i class="fa fa-plus"></i>
                </button>

                <!--Zoom out button-->
                <button class="btn btn-sm btn-secondary"
                        (click)="downscale()"
                        ct-tooltip="Zoom Out"
                        tooltipPlacement="top"
                        [disabled]="graph !== undefined && graph.getScale() <= 0.2">
                    <i class="fa fa-minus"></i>
                </button>

                <!--Fit to Viewport button-->
                <button class="btn btn-sm btn-secondary"
                        ct-tooltip="Fit to Viewport"
                        tooltipPlacement="top"
                        (click)="fitToViewport()">
                    <i class="fa fa-compress"></i>
                </button>
            </span>
            
        </span>

        <!--Inspector Template -->
        <ng-template #inspector>
            <ct-editor-inspector-content>
                <div class="tc-header">
                    {{ inspectedNode.label || inspectedNode.id || inspectedNode.loc || typeOfInspectedNode()}}
                </div>
                <div class="tc-body">
                    <ct-workflow-step-inspector *ngIf="typeOfInspectedNode() === 'Step'"
                                                [fileID]="data.id"
                                                [step]="inspectedNode"
                                                [graph]="graph"
                                                [workflowModel]="model"
                                                [readonly]="readonly">
                    </ct-workflow-step-inspector>

                    <ct-workflow-io-inspector
                        *ngIf="typeOfInspectedNode() === 'Input' || typeOfInspectedNode() === 'Output'"
                        [port]="inspectedNode"
                        [graph]="graph"
                        [workflowModel]="model"
                        [readonly]="readonly">

                    </ct-workflow-io-inspector>

                </div>
            </ct-editor-inspector-content>
        </ng-template>
    `
})
export class WorkflowGraphEditorComponent extends DirectiveBase implements OnChanges, OnDestroy, AfterViewInit {

    @Input()
    model: WorkflowModel;

    @Input()
    data;

    modelEventListeners = [];

    modelChangedFromHistory: WorkflowModel;

    @Input()
    readonly = false;

    @Output()
    modelChange = new EventEmitter();

    @Output()
    draw = new EventEmitter<WorkflowGraphEditorComponent>();

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("controls")
    private controlsTemplate: TemplateRef<any>;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;

    inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    graph: Workflow;

    selectedElement: SVGElement;

    private historyHandler: (ev: KeyboardEvent) => void;

    /**
     * If we're trying to trigger operations on graph that require viewport calculations (like fitting to viewport)
     * it might break because the viewport might not be available. This can happen if n tabs are being opened at the same time
     * so n-1 tabs are rendering without their SVG containers having bounding boxes.
     * So, we will schedule the fitting to be done when user opens the tab next time.
     */
    private tryToFitWorkflowOnNextTabActivation = false;

    private emptyState                            = false;
    private functionsWaitingForRender: Function[] = [];

    constructor(private gateway: DataGatewayService,
                private ipc: IpcService,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private notificationBar: NotificationBarService,
                private workflowEditorService: WorkflowEditorService,
                private modal: ModalService) {
        super();
    }

    private canvasIsInFocus() {
        const el = this.canvas.nativeElement;
        return el.getClientRects().length > 0 && (document.activeElement === el || el.contains(document.activeElement));
    }

    ngAfterViewInit() {

        // Apparently this is the desired and documented solution?
        // https://angular.io/docs/ts/latest/cookbook/component-communication.html#!#parent-to-view-child
        setTimeout(() => {
            if (Workflow.canDrawIn(this.canvas.nativeElement)) {
                this.drawGraphAndAttachListeners();
            } else {
                this.tryToFitWorkflowOnNextTabActivation = true;
            }
        });
    }

    drawGraphAndAttachListeners() {

        this.graph = new Workflow(this.canvas.nativeElement, this.model as any);
        console.log("Drawing graph", this.model);

        if (this.readonly) {
            this.graph.disableGraphManipulations();
        }

        try {
            this.graph.fitToViewport();
        } catch (ex) {
            setTimeout(() => {
                console.warn("Workflow should be able to fit in by now...");
                try {
                    this.graph.fitToViewport();
                    console.log("Should be rendered");
                    this.draw.emit(this);
                    this.functionsWaitingForRender.forEach(fn => fn());
                    this.functionsWaitingForRender = undefined;

                } catch (ex) {
                    console.warn("Screw fitting.");
                }
            }, 1);
        }

        this.graph.on("beforeChange", (event) => {

            // When event is "step.create", model is already in history, so do not push it
            // This is when you drop external node from the tree or you create an input/output port
            if (event && event.type !== "step.create") {
                this.workflowEditorService.putInHistory(this.model);
            }

        });

        this.graph.on("selectionChange", (ev) => {
            this.selectedElement = ev;
        });

        this.tracked = this.ipc.watch("accelerator", "CmdOrCtrl+Z")
            .filter(() => this.canvasIsInFocus() && this.workflowEditorService.canUndo())
            .subscribe(() => {

                this.modelChangedFromHistory = WorkflowFactory.from(this.workflowEditorService.historyUndo(this.model));

                // Resets the reference of inspected node (reference is lost after model serialization)
                this.resetInspectedNodeReference();

                this.modelChange.next(this.modelChangedFromHistory);
            });

        this.tracked = this.ipc.watch("accelerator", "Shift+CmdOrCtrl+Z")
            .filter(() => this.canvasIsInFocus() && this.workflowEditorService.canRedo())
            .subscribe(() => {

                this.modelChangedFromHistory = WorkflowFactory.from(this.workflowEditorService.historyRedo(this.model));

                // Resets the reference of inspected node (reference is lost after model serialization)
                this.resetInspectedNodeReference();

                this.modelChange.next(this.modelChangedFromHistory);
            });
    }

    /**
     * If inspector is open, set reference of inspected node to a new one
     */
    resetInspectedNodeReference() {
        if (this.inspectedNode) {
            const connectionId = this.inspectedNode.connectionId;

            const step         = this.model.steps.find((step) => connectionId === step.connectionId);
            const input        = this.model.inputs.find((input) => connectionId === input.connectionId);
            const output       = this.model.outputs.find((output) => connectionId === output.connectionId);
            this.inspectedNode = step || input || output;

            // When you create some node (i/o or step by dropping it on a canvas) and open it in object inspector, when
            // you go backward in history (undo) object inspector should be closed
            if (!this.inspectedNode) {
                this.inspector.hide();
            }
        }
    }

    /**
     * Register event listeners on a current model
     */
    registerModelEventListeners() {
        // Close object inspector if step/input/output is removed
        const removeHandler = (node) => {
            if (this.inspectedNode && this.inspectedNode.id === node.id) {
                this.inspector.hide();
                this.inspectedNode = null;
            }
        };

        this.modelEventListeners = [
            this.model.on("output.remove", removeHandler),
            this.model.on("input.remove", removeHandler),
            this.model.on("step.remove", removeHandler)
        ];
    }

    ngOnChanges(changes: SimpleChanges) {

        // When model is changed we have to know whether change is external (change revision/copy app...)
        // or internal (undo/redo from history)
        if (changes["model"] && this.model !== changes["model"].previousValue && this.model !== this.modelChangedFromHistory) {

            this.workflowEditorService.emptyHistory();
            this.registerModelEventListeners();
            this.resetInspectedNodeReference();
        }

        if (this.graph && this.canvas && Workflow.canDrawIn(this.canvas.nativeElement)) {
            this.graph.redraw(this.model as any);
        }
        // if (firstAnything && firstAnything.customProps["sbg:x"] === undefined) {
        //     console.log("Should arrange");
        //     // this.graph.command("workflow.arrange");
        // }


        // this.statusBar.setControls(this.controlsTemplate);
    }

    upscale() {
        if (this.graph.getScale() <= Workflow.maxScale) {
            const newScale = this.graph.getScale() + .1;
            this.graph.scaleWorkflowCenter(newScale > Workflow.maxScale ?
                Workflow.maxScale : newScale);
        }
    }

    downscale() {
        if (this.graph.getScale() >= Workflow.minScale) {
            const newScale = this.graph.getScale() - .1;
            this.graph.scaleWorkflowCenter(newScale < Workflow.minScale ?
                Workflow.minScale : newScale);
        }
    }

    fitToViewport() {
        this.graph.fitToViewport();
    }

    arrange() {
        this.graph.arrange();
    }

    deleteSelectedElement() {
        this.graph.deleteSelection();
        this.selectedElement = null;
    }


    /**
     * Triggers when app is dropped on canvas
     */
    onDrop(ev: MouseEvent, nodeID: string) {
        if (this.readonly) {
            return;
        }

        const statusProcess = this.statusBar.startProcess(`Adding ${nodeID} to Workflow...`);

        this.gateway.fetchFileContent(nodeID, true).subscribe((app: any) => {
            // if the app is local, give it an id that's the same as its filename (if doesn't exist)
            const isLocal = DataGatewayService.getFileSource(nodeID) === "local";
            if (isLocal) {
                const split = nodeID.split("/");
                const id    = split[split.length - 1].split(".")[0];
                app.id      = app.id || id;
            }

            this.workflowEditorService.putInHistory(this.model);

            const step = this.model.addStepFromProcess(app);

            // add local source so step can be serialized without embedding
            if (isLocal) {
                step.customProps["sbg:rdfSource"] = nodeID;
                step.customProps["sbg:rdfId"]     = nodeID;
            }

            const coords = this.graph.transformScreenCTMtoCanvas(ev.clientX, ev.clientY);
            Object.assign(step.customProps, {
                "sbg:x": coords.x,
                "sbg:y": coords.y
            });

            this.graph.command("app.create.step", step);

            this.setFocusOnCanvas();

            this.statusBar.stopProcess(statusProcess, `Added ${step.label}`);
        }, err => {
            this.statusBar.stopProcess(statusProcess);
            this.notificationBar.showError("Failed to add an app to workflow: " + err.error ? err.error.message : err.message);
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
     * Set focus on Canvas
     */
    setFocusOnCanvas() {
        // https://github.com/angular/angular/issues/15008#issuecomment-285141070
        this.canvas.nativeElement.focus();
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
        super.ngOnDestroy();

        // Dispose model event listeners (remove step/input/output ...)
        this.modelEventListeners.forEach((item) => {
            item.dispose();
        });

        // When you click on remove tab (X) on non active tab which has no graph rendered yet
        if (this.graph) {
            this.graph.destroy();
        }

        this.workflowEditorService.emptyHistory();
        window.removeEventListener("keypress", this.historyHandler);
        this.inspector.hide();
    }

    setGraphManipulationsLock(isLocked: boolean): void {

        this.scheduleAfterRender(() => {
            if (isLocked) {
                this.graph.disableGraphManipulations();
                return;
            }

            this.graph.enableGraphManipulations();

        });
    }


    checkOutstandingGraphFitting() {
        if (this.tryToFitWorkflowOnNextTabActivation === false) {
            return;
        }
        this.drawGraphAndAttachListeners();
        this.tryToFitWorkflowOnNextTabActivation = false;
    }

    private scheduleAfterRender(fn: Function) {

        if (this.graph) {
            fn();
            return;
        }

        this.functionsWaitingForRender.push(fn);
    }

    setHints() {

        const hints = this.modal.fromComponent(HintsModalComponent, {
            title: "Set Hints",
            backdrop: true,
            closeOnEscape: true
        });

        hints.model = this.model;
        hints.readonly = this.readonly;
    }
}
