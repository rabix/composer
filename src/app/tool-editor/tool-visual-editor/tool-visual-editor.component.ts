import {Component, Input, ViewEncapsulation} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {FileDefModel, RequirementBaseModel, ResourceRequirementModel, SBDraft2CommandLineToolModel} from "cwlts/models/d2sb";
import {ProcessRequirement} from "cwlts/mappings/d2sb/ProcessRequirement";
import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {ComponentBase} from "../../components/common/component-base";
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-tool-visual-editor",
    styleUrls: ["./tool-visual-editor.component.scss"],
    template: `
        <div class="row" *ngIf="model.cwlVersion !== 'sbg:draft-2'">
            <div class="alert alert-warning">
                Only tools which are <code>sbg:draft-2</code> are currently supported. This tool is versioned as <code>{{ model.cwlVersion
                }}</code>.
            </div>
        </div>

        <div class="row" *ngIf="model.cwlVersion === 'sbg:draft-2'">
            <form [class.col-xs-6]="showInspector"
                  [class.col-xs-12]="!showInspector"
                  [formGroup]="formGroup">
                <ct-docker-requirement [dockerRequirement]="model.docker"
                                       (update)="setRequirement($event, true)"
                                       [readonly]="readonly">
                </ct-docker-requirement>

                <ct-base-command [baseCommand]="model.baseCommand"
                                 [context]="{$job: model.job}"
                                 [stdin]="model.stdin"
                                 [stdout]="model.stdout"
                                 (updateCmd)="updateModel('baseCommand', $event)"
                                 (updateStreams)="setStreams($event)"
                                 [readonly]="readonly">
                </ct-base-command>

                <ct-tool-input [location]="model.loc + '.inputs'" [entries]="model.inputs"
                               [context]="{$job: model.job}"
                               [readonly]="readonly"
                               (update)="updateModel('inputs', $event)"
                               [readonly]="readonly">
                </ct-tool-input>

                <ct-tool-output [location]="model.loc + '.outputs'" [entries]="model.outputs || []"
                                [context]="{$job: model.job}"
                                [inputs]="model.inputs || []"
                                [readonly]="readonly"
                                (update)="updateModel('outputs', $event)"
                                [readonly]="readonly">
                </ct-tool-output>

                <ct-resources [entries]="model.resources"
                              [readonly]="readonly"
                              (update)="setResource($event)"
                              [context]="{$job: model.job}"
                              [readonly]="readonly">
                </ct-resources>

                <ct-hint-list [entries]="model.hints || []"
                              [context]="{$job: model.job}"
                              (update)="setHints($event)"
                              [readonly]="readonly">
                </ct-hint-list>

                <ct-argument-list [location]="model.loc + '.arguments'"
                                  [entries]="model.arguments || []"
                                  [readonly]="readonly"
                                  (update)="updateModel('arguments', $event)"
                                  [context]="{$job: model.job}"
                                  [readonly]="readonly">
                </ct-argument-list>

                <ct-file-def-list [entries]="model.createFileRequirement?.fileDef || []"
                                  [location]="model.createFileRequirement?.loc"
                                  [readonly]="readonly"
                                  (update)="updateModel('createFileRequirement', $event)"
                                  [context]="{$job: model.job}"
                                  [readonly]="readonly">
                </ct-file-def-list>
            </form>
        </div>

    `
})
export class ToolVisualEditorComponent extends ComponentBase {

    @Input()
    public model: SBDraft2CommandLineToolModel;

    @Input()
    public readonly: boolean;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    @Input()
    public formGroup: FormGroup;

    private resources: {
        "sbg:CPURequirement"?: ResourceRequirementModel,
        "sbg:MemRequirement"?: ResourceRequirementModel
    } = {};

    constructor(private inspector: EditorInspectorService) {
        super();
    }

    private updateModel(category: string, data: any) {

        if (category === "inputs") {
            this.model.inputs = [];
            data.forEach(input => this.model.addInput(input));
            this.model.updateCommandLine();
        } else if (category === "arguments") {
            this.model.arguments = [];
            data.forEach(argument => this.model.addArgument(argument));
            this.model.updateCommandLine();
        } else if (category === "outputs") {
            this.model.outputs = [];
            data.forEach(output => this.model.addOutput(output));
        } else if (category === "baseCommand") {
            this.model.baseCommand = [];
            data.forEach(cmd => this.model.addBaseCommand(cmd));
            this.model.updateCommandLine();
        } else if (category === "createFileRequirement") {
            if (this.model.createFileRequirement) {
                this.model.createFileRequirement.fileDef = data;
            } else {
                this.model.setRequirement(<ProcessRequirement>{
                    "class": "CreateFileRequirement",
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
        this.model.updateCommandLine();
    }

    private setRequirement(req: ProcessRequirement, hint: boolean) {
        this.model.setRequirement(req, hint);
        this.formGroup.markAsDirty();
    }

    private setHints(hints: RequirementBaseModel[]) {
        this.model.hints = [];
        hints.forEach(hint => {
            this.setRequirement(hint, true);
        });

        this.formGroup.markAsDirty();
    }

    private setResource(resource: ResourceRequirementModel) {
        this.model.setRequirement(resource.serialize(), true);
        this.formGroup.markAsDirty();
    }

    ngOnDestroy() {
        /* Close object inspector*/
        this.inspector.hide();
    }
}
