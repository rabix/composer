import {Component, Input, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommandLineToolModel, FileDefModel, ResourceRequirementModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {ProcessRequirement} from "cwlts/mappings/d2sb/ProcessRequirement";

require("./clt-editor.component.scss");

@Component({
    selector: "ct-clt-editor",
    template: `
        
        <div class="row ">       
            <form [class.col-xs-6]="showInspector" 
                  [class.col-xs-12]="!showInspector" 
                  [formGroup]="formGroup">
                <ct-docker-image-form [dockerRequirement]="model.docker"
                                   [form]="formGroup.controls['dockerGroup']"
                                   (update)="setRequirement($event, true)">
                </ct-docker-image-form>
                                
                <ct-base-command-form [baseCommand]="model.baseCommand"
                                   [context]="{$job: model.job}"
                                   [stdin]="model.stdin"
                                   [stdout]="model.stdout"
                                   [form]="formGroup.controls['baseCommandGroup']"
                                   (updateCmd)="updateModel('baseCommand', $event)"
                                   (updateStreams)="setStreams($event)">
                </ct-base-command-form>
                                
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

                <ct-hint-list [entries]="model.hints || {}" [readonly]="readonly"></ct-hint-list>
                
                <ct-argument-list [location]="model.loc + '.arguments'" 
                                  [entries]="model.arguments || []"     
                                  [readonly]="readonly"                    
                                  (update)="updateModel('arguments', $event)"
                                  [context]="{$job: model.job}">                
                </ct-argument-list>
                
                <ct-file-def-list [entries]="model.createFileRequirement?.fileDef || []"
                                  [location]="model.createFileRequirement?.loc"
                                  [readonly]="readonly"
                                  (update)="updateModel('createFileRequirement', $event)"
                                  [context]="{$job: model.job}">
                </ct-file-def-list>
            </form>
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

    constructor(private formBuilder: FormBuilder) {
        super();


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
        } else if (category === "baseCommand") {
            this.model.baseCommand = [];
            data.forEach(cmd => this.model.addBaseCommand(cmd));
        } else if (category === "createFileRequirement") {
            if (this.model.createFileRequirement) {
                console.log("defs gotten from def-list", data);
                this.model.createFileRequirement.fileDef = data;
            } else {
                this.model.setRequirement(<ProcessRequirement>{
                    'class': "CreateFileRequirement",
                    fileDef: data.map((d: FileDefModel) => d.serialize())
                });
            }
        }

        this.formGroup.markAsDirty();
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

    private setResource(resource: ResourceRequirementModel) {
        this.model.setRequirement(resource.serialize(), true);
        this.formGroup.markAsDirty();
    }

    ngAfterViewInit() {
        // this.inspector.setHostView(this.inspectorContent);
    }
}
