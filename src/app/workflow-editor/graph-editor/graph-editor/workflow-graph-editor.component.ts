import {Component, ElementRef, Input, TemplateRef, ViewChild} from "@angular/core";
import {WorkflowModel} from "cwlts/models";
import {Workflow} from "cwl-svg";
import {StatusBarService} from "../../../core/status-bar/status-bar.service";
declare const Snap: any;
require("./workflow-graph-editor.component.scss");

@Component({
    selector: "ct-workflow-graph-editor",
    template: `
        <svg #canvas class="cwl-workflow"></svg>

        <template #controls>
            
            <span class="btn-group">
                    <button class="btn btn-sm btn-secondary" (click)="downscale()">-</button>
                    <button class="btn btn-sm btn-secondary" (click)="graph.command('workflow.fit')">Fit to Viewport</button>
                    <button class="btn btn-sm btn-secondary" (click)="upscale()">+</button>
                
                </span>
        </template>
    `
})
export class WorkflowGraphEditorComponent {

    @Input()
    public model: WorkflowModel;

    @Input()
    public readonly = false;

    @ViewChild("canvas")
    private canvas: ElementRef;

    @ViewChild("controls")
    private controlsTemplate: TemplateRef<any>;

    private graph: Workflow;

    constructor(private statusBar: StatusBarService) {

    }

    ngAfterViewInit() {


        this.graph = new Workflow(new Snap(this.canvas.nativeElement), this.model);
        this.statusBar.setControls(this.controlsTemplate);
        this.graph.command("workflow.fit");
    }

    private upscale() {
        this.graph.command("workflow.scale", this.graph.getScale()  + .1);
    }

    private downscale() {
        if(this.graph.getScale() > .1){
            this.graph.command("workflow.scale", this.graph.getScale() - .1);

        }
    }


}
