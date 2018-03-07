import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, Inject} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {ProcessRequirement} from "cwlts/mappings/d2sb/ProcessRequirement";
import {ResourceRequirement} from "cwlts/mappings/v1.0";

import {CommandLineToolModel, ExpressionModel} from "cwlts/models";

import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {AppState} from "../reducers";
import {Store} from "@ngrx/store";
import {appTestData} from "../reducers/selectors";
import {AppInfoToken, AppInfo} from "../../editor-common/factories/app-info.factory";

@Component({
    selector: "ct-tool-visual-editor",
    styleUrls: ["./tool-visual-editor.component.scss"],
    template: `
        <form [formGroup]="formGroup">

            <ct-docker-requirement [docker]="model.docker"
                                   (update)="dirty.emit()"
                                   [readonly]="readonly">
            </ct-docker-requirement>

            <ct-form-panel class="base-command-section">
                <div class="tc-header">Base Command</div>
                <div class="tc-body">
                    <ct-base-command-editor [allowExpressions]="model.cwlVersion === 'sbg:draft-2'"
                                            [readonly]="readonly"
                                            [formControl]="form.get('baseCommand')"></ct-base-command-editor>
                </div>
            </ct-form-panel>

            <ct-argument-list [location]="model.loc + '.arguments'"
                              [model]="model"
                              (update)="dirty.emit(); model.updateCommandLine()"
                              [context]="context"
                              [readonly]="readonly">
            </ct-argument-list>

            <ct-tool-input [location]="model.loc + '.inputs'"
                           [model]="model"
                           (update)="dirty.emit(); model.updateCommandLine()"
                           [readonly]="readonly">
            </ct-tool-input>

            <ct-tool-output [location]="model.loc + '.outputs'"
                            [model]="model"
                            [context]="context"
                            [inputs]="model.inputs || []"
                            (update)="dirty.emit()"
                            [readonly]="readonly">
            </ct-tool-output>

            <ct-resources [entries]="model.resources"
                          (update)="updateModel('resources', $event)"
                          [context]="context"
                          [readonly]="readonly">
            </ct-resources>

            <ct-tool-hints [model]="model"
                           [context]="context"
                           (update)="dirty.emit()"
                           [readonly]="readonly">
            </ct-tool-hints>

            <ct-file-def-list [model]="model"
                              [fileRequirement]="model.fileRequirement || {}"
                              [location]="model.fileRequirement?.loc"
                              (update)="updateModel('fileRequirement', $event)"
                              [context]="context"
                              [readonly]="readonly">
            </ct-file-def-list>

            <ct-tool-other [model]="model"
                           [context]="context"
                           (updateStream)="setStreams($event)"
                           (updateCodes)="dirty.emit()"
                           [readonly]="readonly">
            </ct-tool-other>
        </form>

    `
})
export class ToolVisualEditorComponent extends DirectiveBase implements OnDestroy, OnChanges {

    @Input()
    model: CommandLineToolModel;

    @Input()
    readonly: boolean;

    /**
     * ControlGroup that encapsulates the validation for all the nested forms
     * @deprecated  remove this, use internal {@link form}
     */
    @Input()
    formGroup: FormGroup;

    @Output()
    dirty = new EventEmitter<any>();

    context: any;

    form: FormGroup;

    constructor(public inspector: EditorInspectorService, private store: Store<AppState>,
                @Inject(AppInfoToken) private appInfo: AppInfo) {
        super();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.context = this.model.getContext();

        // We have to recreate form controls because model is changed in place
        // so nested objects would still refer to the old model
        if (this.model && this.form && changes.model) {
            this.form.setValue({
                baseCommand: this.model.baseCommand
            }, {emitEvent: false});
        }
    }

    ngOnInit() {

        this.store.select(appTestData(this.appInfo.id)).subscribeTracked(this, () => {
            this.context = this.model.getContext();
        });

        this.form = new FormGroup({
            baseCommand: new FormControl(this.model.baseCommand)
        });

        this.form.get("baseCommand").valueChanges.subscribeTracked(this, () => {
            this.updateBaseCommand(this.form.getRawValue().baseCommand);
        });

        this.form.valueChanges.subscribeTracked(this, () => {
            this.dirty.emit();
        });
    }

    private updateBaseCommand(values: any[]): void {

        this.model.baseCommand = [];

        for (let command of values) {
            if (command instanceof ExpressionModel) {
                this.model.addBaseCommand(command.serialize());
            } else {
                this.model.addBaseCommand(command);
            }
        }

        this.model.updateCommandLine();
    }

    /**
     * @FIXME move conditional clauses into separate methods
     * @param {string} category
     * @param data
     */
    updateModel(category: string, data: any) {

        if (category === "fileRequirement") {
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
        } else if (category === "resources") {
            const memValue = parseInt(data.mem.value, 10);
            const cpuValue = parseInt(data.cores.value, 10);

            if (this.model.cwlVersion === "v1.0") {
                // extending the data object gotten to recapture any other requirement properties (ramMax, coresMax, etc)
                const req = <ResourceRequirement>{
                    ...data, ...{
                        "class": "ResourceRequirement",
                        ramMin: data.mem.serialize(),
                        coresMin: data.cores.serialize()
                    }
                };

                let {ram, cores} = this.context.runtime;

                if (!isNaN(memValue)) {
                    ram = memValue;
                }

                if (!isNaN(cpuValue)) {
                    cores = cpuValue;
                }

                this.model.setRuntime({cores, ram});

                // remove cottontail specific properties so they aren't serialized as customProps
                delete (<any> req).cores;
                delete (<any> req).mem;
                this.model.setRequirement(req);

            } else if (this.model.cwlVersion === "sbg:draft-2") {

                let {mem, cpu} = this.context.$job.allocatedResources;

                if (!isNaN(memValue)) {
                    mem = memValue;
                }

                if (!isNaN(cpuValue)) {
                    cpu = cpuValue;
                }
                this.model.setRuntime({mem, cpu});
            }
        }

        this.dirty.emit();
    }

    setStreams(change) {
        ["stdin", "stdout"].forEach(str => {
            if (change[str]) {
                this.model.updateStream(change[str], <"stdin" | "stdout"> str);
            }
        });
        this.model.updateCommandLine();
        this.dirty.emit();
    }


    ngOnDestroy(): void {
        super.ngOnDestroy();

        /* Close object inspector*/
        if (this.inspector.inspectedObject.getValue() !== "revisions") {
            this.inspector.hide();
        }
    }
}
