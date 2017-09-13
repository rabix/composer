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
import {Process} from "cwlts/models/generic/Process";
import {Observable} from "rxjs/Observable";
import {DataGatewayService} from "../../../core/data-gateway/data-gateway.service";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {AppTabData} from "../../../core/workbox/app-tab-data";
import {AppValidatorService} from "../../../editor-common/app-validator/app-validator.service";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {ErrorNotification, NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {IpcService} from "../../../services/ipc.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {WorkflowEditorService} from "../../workflow-editor.service";

const {dialog} = window["require"]("electron").remote;

@Component({
    selector: "ct-workflow-graph-editor",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./workflow-graph-editor.component.scss"],
    template: `
        <div *ngIf="model && isGraphEmpty()" class="svg-graph-empty-state"></div>

        <svg #canvas class="cwl-workflow" tabindex="-1"
             ct-click
             [ct-drop-enabled]="true"
             [ct-drop-zones]="['zone1']"
             (dblclick)="openInspector($event)"
             (onMouseClick)="setFocusOnCanvas()"
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

            <!--Export image-->
            <span class="btn-group">
                <button class="btn btn-sm btn-secondary"
                        (click)="exportSVG()"
                        ct-tooltip="Export SVG"
                        tooltipPlacement="top">
                    <i class="fa fa-file-image-o"></i>
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
                                                (change)="change.emit()"
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
    data: AppTabData;

    modelEventListeners = [];

    modelChangedFromHistory: WorkflowModel;

    @Input()
    readonly = false;

    @Output()
    modelChange = new EventEmitter();

    @Output()
    draw = new EventEmitter<WorkflowGraphEditorComponent>();

    @Output()
    change = new EventEmitter<any>();

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;

    inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    graph: Workflow;

    selectedElement: SVGElement;

    private historyHandler: (ev: KeyboardEvent) => void;

    private scaleStep = .1;

    /**
     * If we're trying to trigger operations on graph that require viewport calculations (like fitting to viewport)
     * it might break because the viewport might not be available. This can happen if n tabs are being opened at the same time
     * so n-1 tabs are rendering without their SVG containers having bounding boxes.
     * So, we will schedule the fitting to be done when user opens the tab next time.
     */
    private tryToFitWorkflowOnNextTabActivation = false;

    private functionsWaitingForRender: Function[] = [];

    constructor(private gateway: DataGatewayService,
                private ipc: IpcService,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private notificationBar: NotificationBarService,
                private appValidator: AppValidatorService,
                private platformRepository: PlatformRepositoryService,
                private fileRepository: FileRepositoryService,
                private workflowEditorService: WorkflowEditorService) {
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
            if (this.canDraw()) {
                this.drawGraphAndAttachListeners();
            } else {
                this.tryToFitWorkflowOnNextTabActivation = true;
            }
        });
    }

    drawGraphAndAttachListeners() {

        this.graph = new Workflow(this.canvas.nativeElement, this.model as any);

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

        this.graph.on("afterChange", () => {
            this.change.emit();
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

        if (this.graph && this.canvas && this.canDraw()) {
            this.graph.redraw(this.model as any);
        }
    }

    upscale() {
        if (this.graph.getScale() <= Workflow.maxScale) {
            const newScale = this.graph.getScale() + this.scaleStep;
            this.graph.scaleWorkflowCenter(newScale > Workflow.maxScale ?
                Workflow.maxScale : newScale);
        }
    }

    downscale() {
        if (this.graph.getScale() >= Workflow.minScale) {
            const newScale = this.graph.getScale() - this.scaleStep;
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

        const isLocal                = AppHelper.isLocal(nodeID);
        const fetch: Promise<string> = isLocal
            ? this.fileRepository.fetchFile(nodeID)
            : this.platformRepository.getApp(nodeID).then(app => JSON.stringify(app));

        fetch.then((result) => {
            return this.gateway.resolveContent(result, nodeID).toPromise();
        }).then(resolved => {
            return this.appValidator.createValidator(Observable.of(JSON.stringify(resolved)))
                .filter(val => !val.isPending)
                .take(1)
                .toPromise()
                .then(val => {
                    if (val.isValidCWL) {
                        return resolved;
                    }

                    throw new Error("App did not pass JSON schema validation");
                });
        }).then((resolved: Process) => {
            // if the app is local, give it an id that's the same as its filename (if doesn't exist)
            if (isLocal) {
                resolved.id = resolved.id || AppHelper.getBasename(nodeID, true);
            }

            this.workflowEditorService.putInHistory(this.model);

            const step = this.model.addStepFromProcess(resolved);

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
            this.notificationBar.showNotification(new ErrorNotification(`Failed to add ${nodeID} to workflow. ${new ErrorWrapper(err)}`));
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

    redrawIfCanDrawInWorkflow(): boolean {

        if (this.canDraw()) {
            this.graph.redraw();
            return true;
        }

        return false;
    }

    /**
     * Check if we still have to draw the graph for the first time
     * Do that if necessary
     */
    checkOutstandingGraphFitting() {
        if (this.tryToFitWorkflowOnNextTabActivation === false) {
            return;
        }
        this.drawGraphAndAttachListeners();
        this.tryToFitWorkflowOnNextTabActivation = false;
    }

    exportSVG() {
        const svg = this.canvas.nativeElement as SVGSVGElement;

        const content = this.renderSVGBundle(svg);

        dialog.showSaveDialog({
            buttonLabel: "Save",
            defaultPath: `${this.data.id}.svg`,
            title: "Export Workflow SVG",

        }, (path) => {

            if (!path) {
                return;
            }

            if( !path.endsWith(".svg")){
            path +=  ".svg" ;
            }

            this.ipc.request("saveFileContent", {
                path,
                content
            }).toPromise().then(() => {
                this.statusBar.instant(`Exported SVG to ${path}`);
            }, err => {
                this.notificationBar.showNotification(new ErrorNotification("Could not save SVG: " + err, 5000));
            });
        });

    }

    private scheduleAfterRender(fn: Function) {

        if (this.graph) {
            fn();
            return;
        }

        this.functionsWaitingForRender.push(fn);
    }


    private renderSVGBundle(root: SVGSVGElement) {

        const containerElements = ["svg", "g"];
        const embeddableStyles  = {
            "rect": ["fill", "stroke", "stroke-width"],
            "path": ["fill", "stroke", "stroke-width"],
            "circle": ["fill", "stroke", "stroke-width"],
            "line": ["stroke", "stroke-width"],
            "text": ["fill", "font-size", "text-anchor", "font-family"],
            "polygon": ["stroke", "fill"]
        };

        function traverse(parentNode, originalData) {

            const children             = parentNode.childNodes;
            const originalChildrenData = originalData.childNodes;

            for (let childIndex = 0; childIndex < children.length; childIndex++) {
                const child   = children[childIndex];
                const tagName = child.tagName;

                if (containerElements.indexOf(tagName) !== -1) {
                    traverse(child, originalChildrenData[childIndex]);
                } else if (tagName in embeddableStyles) {

                    const styleDefinition = window.getComputedStyle(originalChildrenData[childIndex]);

                    let styleString = "";
                    for (let st = 0; st < embeddableStyles[tagName].length; st++) {
                        styleString +=
                            embeddableStyles[tagName][st]
                            + ":"
                            + styleDefinition.getPropertyValue(embeddableStyles[tagName][st])
                            + "; ";
                    }

                    child.setAttribute("style", styleString);
                }
            }

        }


        const clone = root.cloneNode(true) as SVGSVGElement;
        Array.from(clone.querySelectorAll(".port .label")).forEach(el => el.parentNode.removeChild(el));
        traverse(clone, root);

        return new XMLSerializer().serializeToString(clone);
    }

    /**
     +     * Tells whether graph is empty (nothing to render on SVG)
     +     */
    isGraphEmpty() {
        return this.model && !(this.model.steps.length || this.model.inputs.length || this.model.outputs.length);
    }

    /**
     * Tells whether there is a canvas in which workflow can be drawn
     */
    private canDraw(): boolean {
        return Workflow.canDrawIn(this.canvas.nativeElement);
    }
}
