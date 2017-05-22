import {Component, Input, OnDestroy, OnChanges} from "@angular/core";
import {FormGroup} from "@angular/forms";

import {CommandLineToolModel} from "cwlts/models";
import {ProcessRequirement} from "cwlts/mappings/d2sb/ProcessRequirement";

import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-tool-visual-editor",
    styleUrls: ["./tool-visual-editor.component.scss"],
    template: `
        <form [formGroup]="formGroup">
            <ct-docker-requirement [docker]="model.docker"
                                   (update)="formGroup.markAsDirty()"
                                   [readonly]="readonly">
            </ct-docker-requirement>

            <ct-base-command [baseCommand]="model.baseCommand"
                             [model]="model"
                             [stdin]="model.stdin"
                             [stdout]="model.stdout"
                             (updateCmd)="updateModel('baseCommand', $event)"
                             (updateStreams)="setStreams($event)"
                             [readonly]="readonly">
            </ct-base-command>

            <ct-tool-input [location]="model.loc + '.inputs'"
                           [model]="model"
                           (update)="formGroup.markAsDirty(); model.updateCommandLine()"
                           [readonly]="readonly">
            </ct-tool-input>

            <ct-tool-output [location]="model.loc + '.outputs'"
                            [model]="model"
                            [context]="context"
                            [inputs]="model.inputs || []"
                            (update)="formGroup.markAsDirty()"
                            [readonly]="readonly">
            </ct-tool-output>

            <ct-resources [entries]="model.resources"
                          (update)="formGroup.markAsDirty()"
                          [context]="context"
                          [readonly]="readonly">
            </ct-resources> 
            
            <ct-hints [model]="model"
                      [context]="context"
                      (update)="formGroup.markAsDirty()"
                      [readonly]="readonly">
            </ct-hints>
            
            <ct-argument-list [location]="model.loc + '.arguments'"
                              [model]="model"
                              (update)="formGroup.markAsDirty(); model.updateCommandLine()"
                              [context]="context"
                              [readonly]="readonly">
            </ct-argument-list>

            <ct-file-def-list [model]="model.fileRequirement || {}"
                              [location]="model.fileRequirement?.loc"
                              (update)="updateModel('fileRequirement', $event)"
                              [context]="context"
                              [readonly]="readonly">
            </ct-file-def-list>
        </form>

    `
})
export class ToolVisualEditorComponent extends DirectiveBase implements OnDestroy, OnChanges {

    @Input()
    model: CommandLineToolModel;

    @Input()
    readonly: boolean;

    /** ControlGroup that encapsulates the validation for all the nested forms */
    @Input()
    formGroup: FormGroup;

    context: any;

    constructor(public inspector: EditorInspectorService) {
        super();
    }

    ngOnChanges() {
        this.context = this.model.getContext();
    }

    updateModel(category: string, data: any) {

        if (category === "baseCommand") {
            this.model.baseCommand = [];
            data.forEach(cmd => this.model.addBaseCommand(cmd));
            this.model.updateCommandLine();

        } else if (category === "fileRequirement") {
            if (!this.model.fileRequirement) {
                if (this.model.cwlVersion === "v1.0") {
                    this.model.setRequirement(<ProcessRequirement>{
                        "class": "InitialWorkDirRequirement",
                        listing: data.map(d => d.serialize())
                    });
                } else if (this.model.cwlVersion === "sbg:draft-2") {
                    this.model.setRequirement(<ProcessRequirement>{
                        "class": "CreateFileRequirement",
                        fileDef: data.map(d => d.serialize())
                    });
                }
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

    ngOnDestroy() {
        /* Close object inspector*/
        if (this.inspector.inspectedObject.getValue() !== "revisions") {
            this.inspector.hide();
        }
    }
}
