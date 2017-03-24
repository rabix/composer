import {Component, Input, OnDestroy} from "@angular/core";
import {FormGroup} from "@angular/forms";

import {FileDefModel, ResourceRequirementModel} from "cwlts/models/d2sb";
import {CommandLineToolModel, RequirementBaseModel} from "cwlts/models";
import {ProcessRequirement} from "cwlts/mappings/d2sb/ProcessRequirement";

import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-visual-editor",
    styleUrls: ["./tool-visual-editor.component.scss"],
    template: `
            <form [formGroup]="formGroup">
                
                <ct-docker-requirement [dockerRequirement]="model.docker"
                                       (update)="setRequirement($event, true)"
                                       [readonly]="readonly">
                </ct-docker-requirement>

                <ct-base-command [baseCommand]="model.baseCommand"
                                 [context]="{$job: model.job}"
                                 [model]="model"
                                 [stdin]="model.stdin"
                                 [stdout]="model.stdout"
                                 (updateCmd)="updateModel('baseCommand', $event)"
                                 (updateStreams)="setStreams($event)"
                                 [readonly]="readonly">
                </ct-base-command>

                <ct-tool-input [location]="model.loc + '.inputs'"
                               [context]="{$job: model.job}"
                               [model]="model"
                               (update)="updateModel('inputs', $event)"
                               [readonly]="readonly">
                </ct-tool-input>

                <ct-tool-output [location]="model.loc + '.outputs'" 
                                [context]="{$job: model.job}"
                                [model]="model"
                                [inputs]="model.inputs || []"
                                (update)="updateModel('outputs', $event)"
                                [readonly]="readonly">
                </ct-tool-output>

                <ct-resources [entries]="model.resources"
                              *ngIf="model.cwlVersion === 'sbg:draft-2'"
                              (update)="setResource($event)"
                              [context]="{$job: model.job}"
                              [readonly]="readonly">
                </ct-resources>

                <ct-hint-list [entries]="model.hints || []"
                              [context]="{$job: model.job}"
                              *ngIf="model.cwlVersion === 'sbg:draft-2'"
                              (update)="setHints($event)"
                              [readonly]="readonly">
                </ct-hint-list>

                <ct-argument-list [location]="model.loc + '.arguments'"
                                  [model]="model"
                                  (update)="updateModel('arguments', $event)"
                                  [context]="{$job: model.job}"
                                  [readonly]="readonly">
                </ct-argument-list>
                
                <ct-file-def-list [entries]="model.createFileRequirement?.fileDef || []"
                                  [location]="model.createFileRequirement?.loc"
                                  *ngIf="model.cwlVersion === 'sbg:draft-2'"
                                  (update)="updateModel('createFileRequirement', $event)"
                                  [context]="{$job: model.job}"
                                  [readonly]="readonly">
                </ct-file-def-list>
            </form>

    `
})
export class ToolVisualEditorComponent extends DirectiveBase implements OnDestroy {

    @Input()
    model: CommandLineToolModel;

    @Input()
    readonly: boolean;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    @Input()
    formGroup: FormGroup;

    constructor(public inspector: EditorInspectorService) {
        super();
    }

    updateModel(category: string, data: any) {

        if (category === "inputs" || category === "arguments") {
            this.model.updateCommandLine();

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

    setStreams(change) {
        ["stdin", "stdout"].forEach(str => {
            if (change[str]) {
                this.model.updateStream(change[str], <"stdin" | "stdout"> str);
            }
        });
        this.model.updateCommandLine();
        this.formGroup.markAsDirty();
    }

    setRequirement(req: ProcessRequirement, hint: boolean) {
        this.model.setRequirement(req, hint);
        this.formGroup.markAsDirty();
    }

    setHints(hints: RequirementBaseModel[]) {
        this.model.hints = [];
        hints.forEach(hint => {
            this.setRequirement(hint, true);
        });

        this.formGroup.markAsDirty();
    }

    setResource(resource: ResourceRequirementModel) {
        this.model.setRequirement(resource.serialize(), true);
        this.formGroup.markAsDirty();
    }

    ngOnDestroy() {
        /* Close object inspector*/
        if (this.inspector.inspectedObject.getValue() !== "revisions") {
            this.inspector.hide();
        }
    }
}
