import {Component, Input, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineToolModel, ExpressionModel, ResourceRequirementModel, RequirementBaseModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {ProcessRequirement} from "cwlts/mappings/d2sb/ProcessRequirement";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    providers: [EditorInspectorService],
    template: `
        
        <div class="row ">       
            <form [class.col-xs-6]="showInspector" 
                  [class.col-xs-12]="!showInspector" 
                  [formGroup]="formGroup">
                <ct-docker-image-form [dockerRequirement]="model.docker"
                                   [form]="formGroup.controls['dockerGroup']"
                                   (update)="setRequirement($event, true)">
                </ct-docker-image-form>
                          
                <base-command-form [baseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [stdin]="model.stdin"
                                   [stdout]="model.stdout"
                                   [form]="formGroup.controls['baseCommandGroup']"
                                   (updateCmd)="setBaseCommand($event)"
                                   (updateStreams)="setStreams($event)">
                </base-command-form>
                                
                <ct-tool-input-list [location]="model.loc + '.inputs'" [entries]="model.inputs" 
                              (update)="updateModel('inputs', $event)">                             
                </ct-tool-input-list>
                
                <ct-tool-output-list [location]="model.loc + '.outputs'" [entries]="model.outputs || []" 
                              [inputs]="model.inputs || []" 
                              [readonly]="readonly" 
                              (update)="updateModel('outputs', $event)">                        
                </ct-tool-output-list>
                                   
                <ct-resources [entries]="model.resources" 
                              [readonly]="readonly" 
                              (update)="setResource($event)" 
                              [context]="{$job: model.job}">
                </ct-resources>

                <ct-hint-list [entries]="model.hints || {}" 
                              [readonly]="readonly"
                              (update)="setHints($event)"></ct-hint-list>
                
                <ct-argument-list [location]="model.loc + '.arguments'" 
                                  [entries]="model.arguments || []"     
                                  [readonly]="readonly"                    
                                  (update)="updateModel('arguments', $event)"
                                  [context]="{$job: model.job}">                
                </ct-argument-list>
                
                <ct-file-def-list [entries]="model.createFileRequirement?.fileDef || []"></ct-file-def-list>
            </form>
            
            <ct-editor-inspector class="col-xs-6" [hidden]="!showInspector">
                <template #inspector></template>
            </ct-editor-inspector>
        </div>

    `
})
export class CltEditorComponent extends ComponentBase implements OnInit {

    @Input()
    public model: CommandLineToolModel;

    @Input()
    public readonly: boolean;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    @Input()
    public formGroup: FormGroup;

    private resources: {
        "sbg:CPURequirement"?: ResourceRequirementModel,
        "sbg:MemRequirement"?: ResourceRequirementModel
    } = {};

    @ViewChild("inspector", {read: ViewContainerRef})
    private inspectorContent: ViewContainerRef;

    @Input()
    public showInspector = false;

    constructor(private formBuilder: FormBuilder,
                private inspector: EditorInspectorService) {
        super();

        this.tracked = this.inspector.inspectedObject.map(obj => obj !== undefined)
            .subscribe(show => this.showInspector = show);
    }

    ngOnInit() {

        this.formGroup.addControl("dockerGroup", this.formBuilder.group({}));
        this.formGroup.addControl("baseCommandGroup", this.formBuilder.group({}));
        this.formGroup.addControl("inputs", this.formBuilder.group({}));
        this.formGroup.addControl("outputs", this.formBuilder.group({}));
        this.formGroup.addControl("arguments", this.formBuilder.group({}));

        console.log("Model", this.model);
    }

    private updateModel(category: string, data: any) {

        if (category === "inputs") {
            this.model.inputs = [];
            data.forEach(input => this.model.addInput(input));
        } else if (category === "arguments") {
            this.model.arguments = [];
            data.forEach(argument => this.model.addArgument(argument));
        } else if (category === "outputs") {
            this.model.outputs = [];
            data.forEach(output => this.model.addOutput(output));
        }

        if (this.formGroup.controls[category] instanceof FormGroup) {
            this.formGroup.controls[category].markAsDirty();
        }
    }

    private setStreams(change) {
        ["stdin", "stdout"].forEach(str => {
            if (change[str]) this.model.updateStream(change[str], <"stdin" | "stdout"> str);
        });
    }

    private setRequirement(req: ProcessRequirement, hint: boolean) {
        this.model.setRequirement(req, hint);
        this.formGroup.markAsDirty();
    }

    private setHints(hints: RequirementBaseModel[]) {
        this.model.hints = [];
        hints.forEach(hint => this.setRequirement(hint.serialize(), true));

        this.formGroup.markAsDirty();
    }

    private setResource(resource: ResourceRequirementModel) {
        this.model.setRequirement(resource.serialize(), true);
        this.formGroup.markAsDirty();
    }

    private setBaseCommand(list: ExpressionModel[]) {
        this.model.baseCommand = [];
        list.forEach(cmd => this.model.addBaseCommand(cmd));
    }

    ngAfterViewInit() {
        this.inspector.setHostView(this.inspectorContent);
    }
}
