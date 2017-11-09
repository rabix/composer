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
import {
    SVGArrangePlugin, SVGEdgeHoverPlugin, SVGNodeMovePlugin, SVGPortDragPlugin, SVGValidatePlugin,
    SelectionPlugin, Workflow, DeletionPlugin
} from "cwl-svg";
import {ZoomPlugin} from "cwl-svg/src/plugins/zoom";
import {
    StepModel,
    WorkflowFactory,
    WorkflowInputParameterModel,
    WorkflowModel,
    WorkflowOutputParameterModel
} from "cwlts/models";
import {Process} from "cwlts/models/generic/Process";
import {Observable} from "rxjs/Observable";
import {DataGatewayService} from "../../../core/data-gateway/data-gateway.service";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {ErrorWrapper} from "../../../core/helpers/error-wrapper";
import {AppTabData} from "../../../core/workbox/app-tab-data";
import {AppValidatorService} from "../../../editor-common/app-validator/app-validator.service";
import {EditorInspectorService} from "../../../editor-common/inspector/editor-inspector.service";
import {FileRepositoryService} from "../../../file-repository/file-repository.service";
import {NotificationBarService} from "../../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {IpcService} from "../../../services/ipc.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {WorkflowEditorService} from "../../workflow-editor.service";
import {WorkflowEditorComponent} from "../../workflow-editor.component";
import {SvgDumper} from "../svg-dumper/svg-dumper";
import {UpdatePlugin} from "../update-plugin/update-plugin";

const {dialog} = window["require"]("electron").remote;

@Component({
    selector: "ct-workflow-graph-editor",
    encapsulation: ViewEncapsulation.None,
    styleUrls: ["./workflow-graph-editor.component.scss"],
    templateUrl: "./workflow-graph-editor.component.html"
})
export class WorkflowGraphEditorComponent extends DirectiveBase implements OnChanges, OnDestroy, AfterViewInit {

    @Input() model: WorkflowModel;

    @Input()
    host: WorkflowEditorComponent;

    @Input() data: AppTabData;

    @Input() readonly = false;

    @Output() modelChange = new EventEmitter();

    @Output() draw = new EventEmitter<WorkflowGraphEditorComponent>();

    @Output() change = new EventEmitter<any>();

    graph: Workflow;

    inspectedNode: StepModel | WorkflowOutputParameterModel | WorkflowInputParameterModel = null;

    modelChangedFromHistory: WorkflowModel;

    modelEventListeners = [];

    selectedElement: SVGElement;

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("inspector", {read: TemplateRef})
    private inspectorTemplate: TemplateRef<any>;


    private historyHandler: (ev: KeyboardEvent) => void;

    private scaleStep = 0.1;

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

        this.graph = new Workflow({
            svgRoot: this.canvas.nativeElement as SVGSVGElement,
            model: this.model as any,
            plugins: [
                new SVGArrangePlugin(),
                new SVGPortDragPlugin(),
                new SVGNodeMovePlugin(),
                new SVGEdgeHoverPlugin(),
                new SVGValidatePlugin(),
                new SelectionPlugin(),
                new ZoomPlugin(),
                new DeletionPlugin(),
                new UpdatePlugin(this.statusBar, this.platformRepository, this.notificationBar)
            ],
            editingEnabled: !this.readonly
        });

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

        this.graph.getPlugin(SelectionPlugin).registerOnSelectionChange((ev) => {
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
        this.detachModelEventListeners();

        // Close object inspector if step/input/output is removed
        const removeHandler = (node) => {
            if (this.inspectedNode && this.inspectedNode.id === node.id) {
                this.inspector.hide();
                this.inspectedNode = null;
            }
        };

        const changeHandler = (...args: any[]) => {
            this.change.emit();
        };

        this.modelEventListeners = [
            this.model.on("output.remove", removeHandler),
            this.model.on("input.remove", removeHandler),
            this.model.on("step.remove", removeHandler),
            this.model.on("connection.create", changeHandler),
            this.model.on("connection.remove", changeHandler),
            this.model.on("output.remove", changeHandler),
            this.model.on("output.create", changeHandler),
            this.model.on("input.remove", changeHandler),
            this.model.on("input.create", changeHandler),
            this.model.on("step.remove", changeHandler),
            this.model.on("step.update", changeHandler)
            /**
             * because the workflow editor directly causes "step.create" to be emitted
             * and it has to do some work afterward, this.change.emit() is triggered manually
             * see {@link WorkflowGraphEditorComponent.onDrop}
             */

        ];
    }

    detachModelEventListeners() {
        this.modelEventListeners.forEach(handler => {
            handler.dispose();
        })
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
            this.graph.draw(this.model as any);
        }
    }

    upscale() {
        const scale = this.graph.scale;

        if (scale < this.graph.maxScale) {
            this.graph.scale = Math.min(scale + this.scaleStep, this.graph.maxScale);
        }
    }

    downscale() {
        const scale = this.graph.scale;

        if (scale > this.graph.minScale) {
            this.graph.scale = Math.max(scale - this.scaleStep, this.graph.minScale);
        }
    }

    fitToViewport() {
        this.graph.fitToViewport();
    }

    arrange() {
        this.graph.getPlugin(SVGArrangePlugin).arrange();
    }

    deleteSelectedElement() {
        this.graph.getPlugin(DeletionPlugin).deleteSelection();
    }


    /**
     * Triggers when app is dropped on canvas
     */
    onDrop(ev: MouseEvent, nodeID: string) {
        if (this.readonly) {
            return;
        }

        const statusProcess = this.statusBar.startProcess(`Adding ${nodeID} to Workflow...`);

        const isLocal = AppHelper.isLocal(nodeID);

        const fetch: Promise<string> = isLocal
            ? this.fileRepository.fetchFile(nodeID)
            : this.platformRepository.getApp(nodeID).then(app => JSON.stringify(app));

        fetch.then(result => this.gateway.resolveContent(result, nodeID).toPromise())
            .then(resolved => {
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
            })
            .then((resolved: Process) => {
                // if the app is local, give it an id that's the same as its filename (if doesn't exist)
                if (isLocal) {
                    resolved.id = resolved.id || AppHelper.getBasename(nodeID, true);
                }

                this.workflowEditorService.putInHistory(this.model);

                const coords  = this.graph.transformScreenCTMtoCanvas(ev.clientX, ev.clientY);
                const patched = Object.assign(resolved, {
                    "sbg:x": coords.x,
                    "sbg:y": coords.y
                });

                const step = this.model.addStepFromProcess(patched);

                // add local source so step can be serialized without embedding
                if (isLocal) {
                    step.customProps["sbg:rdfSource"] = nodeID;
                    step.customProps["sbg:rdfId"]     = nodeID;
                }

                this.change.emit();
                this.setFocusOnCanvas();

            this.statusBar.stopProcess(statusProcess, `Added ${step.label}`);
        }).then(() => {
            // Resolve model current content in order to prevent nesting recursion
            this.host.resolveCurrentContent();
        }).catch( err => {
            this.statusBar.stopProcess(statusProcess);
            this.notificationBar.showNotification(`Failed to add ${nodeID} to workflow. ${new ErrorWrapper(err)}`);
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
        this.detachModelEventListeners();

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
                this.graph.enableEditing(false);
                return;
            }

            this.graph.enableEditing(true);

        });
    }

    redrawIfCanDrawInWorkflow(): boolean {

        if (this.canDraw()) {
            this.graph.draw();
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

        const content = new SvgDumper(this.canvas.nativeElement).dump();

        dialog.showSaveDialog({
            buttonLabel: "Save",
            defaultPath: `${this.data.id}.svg`,
            title: "Export Workflow SVG",

        }, (path) => {

            if (!path) {
                return;
            }

            if (!path.endsWith(".svg")) {
                path += ".svg";
            }

            this.ipc.request("saveFileContent", {path, content}).toPromise().then(() => {
                this.statusBar.instant(`Exported SVG to ${path}`);
            }, err => {
                this.notificationBar.showNotification("Could not save SVG: " + err, {timeout: 50000});
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

    /**
     +     * Tells whether graph is empty (nothing to render on SVG)
     +     */
    isGraphEmpty() {

        const hasNoStepsOrIO = !this.model.steps.length && !this.model.inputs.length && !this.model.outputs.length;
        return this.model && hasNoStepsOrIO;
    }

    /**
     * Tells whether there is a canvas in which workflow can be drawn
     */
    private canDraw(): boolean {
        return Workflow.canDrawIn(this.canvas.nativeElement);
    }
}
