import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from "@angular/core";
import {CommandInputParameterModel, CommandLineToolModel, WorkflowInputParameterModel, WorkflowModel} from "cwlts/models";
import {SystemService} from "../../../platform-providers/system.service";

@Component({
    selector: "ct-app-info",
    styleUrls: ["./app-info.component.scss"],
    template: `
        <div class="app-info">

            <!--Header section-->
            <div class="info-section">
                <ct-inline-editor [value]="model.label" type="text"
                                  [disabled]="readonly"
                                  (saveData)="updateLabel($event)">

                    <h1 class="h3" data-test="app-info-title">{{model.label}}</h1>
                </ct-inline-editor>
                <div>Created by {{createdBy}} on {{createdOn | date}}. Last edited by {{editedBy}} on {{editedOn | date}}</div>
                <div *ngIf="revisionNote">Revision note: “<em>{{revisionNote}}</em>”</div>
            </div>

            <!--Description section-->
            <div class="info-section">
                <div class="text-title">Description:</div>
                <ct-inline-editor [value]="model.description"
                                  [disabled]="readonly"
                                  type="textarea"
                                  (saveData)="updateDescription($event)">
                    <div [ct-markdown]="model.description"></div>
                </ct-inline-editor>
            </div>

            <!--Meta section-->
            <div class="info-section">
                <div class="app-info-meta">



                    <!--Toolkit-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item" *ngIf="isToolkit()">
                        <div class="text-title">Toolkit:</div>
                        <div>
                            <ct-inline-editor [disabled]="readonly" class="toolkit"
                                              [value]="model.customProps['sbg:toolkit']"
                                              type="text"
                                              (saveData)="updateCustomProp('sbg:toolkit', $event)">
                                {{model.customProps['sbg:toolkit']}}
                            </ct-inline-editor>
                            <ct-inline-editor class="toolkit"
                                              [disabled]="readonly"
                                              [value]="model.customProps['sbg:toolkitVersion']"
                                              type="text"
                                              (saveData)="updateCustomProp('sbg:toolkitVersion', $event)">
                                {{model.customProps['sbg:toolkitVersion']}}
                            </ct-inline-editor>
                        </div>
                    </div>

                    <!--Author-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">{{isToolkit() ? "Toolkit" : "Workflow"}} Author:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:toolAuthor']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="updateCustomProp('sbg:toolAuthor', $event)">
                            {{model.customProps['sbg:toolAuthor']}}
                        </ct-inline-editor>
                    </div>

                    <!--License-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">{{isToolkit() ? "Toolkit" : "Workflow"}} License:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:license']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="updateCustomProp('sbg:license', $event)">
                            <div>{{model.customProps['sbg:license']}}</div>
                        </ct-inline-editor>
                    </div>

                    <!--Contributors-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Contributors:</div>
                        {{(model.customProps['sbg:contributors'] || []).join(", ")}}
                    </div>


                    <!--Wrapper Author-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Wrapper Author:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:wrapperAuthor']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="updateCustomProp('sbg:wrapperAuthor', $event)">
                            <div>{{model.customProps['sbg:wrapperAuthor']}}</div>
                        </ct-inline-editor>
                    </div>

                    <!--Wrapper License-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Wrapper License:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:wrapperLicense']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="updateCustomProp('sbg:wrapperLicense', $event)">
                            <div>{{model.customProps['sbg:wrapperLicense']}}</div>
                        </ct-inline-editor>
                    </div>

                    <!--Categories-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Categories:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:categories']"
                                          type="tags"
                                          [disabled]="readonly"
                                          [options]="categories"
                                          (saveData)="updateCustomProp('sbg:categories', $event)">
                            {{ (model.customProps['sbg:categories'] || []).join(", ")}}
                        </ct-inline-editor>
                    </div>

                    <!--CWL version-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">CWL Version:</div>
                        {{model['cwlVersion']}}
                    </div>

                    <!--Links-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Links:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:links']"
                                          [disabled]="readonly"
                                          type="keyvalue"
                                          (saveData)="updateCustomProp('sbg:links', $event)">

                            <span *ngFor="let link of model.customProps['sbg:links']" class="links">
                                    <a href=""
                                       (click)="$event.preventDefault();
                                       $event.stopPropagation();
                                       openWebPage(link.id)">{{link.label}}</a>
                            </span>

                        </ct-inline-editor>
                    </div>

                    <!--ID-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">ID</div>
                        {{model.customProps['sbg:id']}}
                    </div>
                </div>

            </div>

            <ct-form-panel>

                <div class="tc-header">
                    Ports
                </div>

                <div class="tc-body">

                    <!--Table section-->
                    <div class="info-section">

                        <ct-tab-selector distribute="auto" [active]="viewMode" (activeChange)="switchTab($event)">
                            <ct-tab-selector-entry tabName="inputs">Inputs</ct-tab-selector-entry>
                            <ct-tab-selector-entry tabName="appSettings">App Settings</ct-tab-selector-entry>
                            <ct-tab-selector-entry tabName="outputs">Outputs</ct-tab-selector-entry>
                        </ct-tab-selector>

                        <!--Inputs-->
                        <div *ngIf="viewMode === 'inputs'">
                            <div class="no-ports-defined" *ngIf="inputs.length === 0">
                                No inputs defined.
                            </div>
                            <table class="table table-striped" *ngIf="inputs.length > 0">
                                <tr>
                                    <th>ID</th>
                                    <th>Label</th>
                                    <th>Type</th>
                                    <th>Required</th>
                                    <th>Prefix</th>
                                    <th>Format</th>
                                </tr>
                                <tr *ngFor="let input of inputs">
                                    <td>{{input.id}}</td>
                                    <td>{{input.label}}</td>
                                    <td>{{input.type | commandParameterType}}</td>
                                    <td>{{input.type.isNullable ? 'False' : 'True'}}</td>
                                    <td>{{input.inputBinding?.prefix || "-" }}</td>
                                    <td>{{input.fileTypes ? input.fileTypes.join(', ') : '-'}}</td>
                                </tr>
                            </table>
                        </div>


                        <!--App settings-->
                        <div *ngIf="viewMode === 'appSettings'">
                            <div class="no-ports-defined" *ngIf="appSettings.length === 0">
                                No app settings defined.
                            </div>
                            <table class="table table-striped" *ngIf="appSettings.length > 0">
                                <tr>
                                    <th>ID</th>
                                    <th>Label</th>
                                    <th>Type</th>
                                    <th>Required</th>
                                    <th>Prefix</th>
                                    <th>Format</th>
                                </tr>
                                <tr *ngFor="let input of appSettings">
                                    <td>{{input.id}}</td>
                                    <td>{{input.label}}</td>
                                    <td>{{input.type | commandParameterType}}</td>
                                    <td>{{input.type.isNullable ? 'False' : 'True'}}</td>
                                    <td>{{input.inputBinding?.prefix || "-" }}</td>
                                    <td>{{input.fileTypes ? input.fileTypes.join(', ') : '-'}}</td>
                                </tr>
                            </table>
                        </div>


                        <!--Outputs-->
                        <div *ngIf="viewMode === 'outputs'">
                            <div class="no-ports-defined" *ngIf="model.outputs.length === 0">
                                No outputs defined.
                            </div>
                            <table class="table table-striped" *ngIf="model.outputs.length > 0">
                                <tr>
                                    <th>ID</th>
                                    <th>Label</th>
                                    <th>Type</th>
                                    <th>Format</th>
                                </tr>
                                <tr *ngFor="let output of model.outputs">
                                    <td>{{output.id}}</td>
                                    <td>{{output.label}}</td>
                                    <td>{{output.type | commandParameterType}}</td>
                                    <td>{{output.fileTypes ? output.fileTypes.join(', ') : '-'}}</td>
                                </tr>
                            </table>
                        </div>


                    </div>
                </div>

            </ct-form-panel>
        </div>
    `
})
export class AppInfoComponent implements OnChanges {

    viewMode = "inputs";

    categories = [
        "DNA",
        "WGS",
        "WES (WXS)",
        "RNA",
        "Targeted sequencing",
        "Assembly",
        "Alignment",
        "Annotation",
        "BED Processing",
        "Converters",
        "Differential Expression",
        "FASTA Processing",
        "FASTQ Processing",
        "Indexing",
        "Other",
        "Plotting and Rendering",
        "Prioritization",
        "SAM/BAM Processing",
        "Text Processing",
        "VCF Processing",
        "Variant Calling",
        "Quality Control",
        "Quantification"
    ];

    @Input()
    public readonly = false;

    @Input()
    model: WorkflowModel | CommandLineToolModel;

    @Output()
    change = new EventEmitter();

    public createdBy: string;
    public createdOn: number;
    public editedBy: string;
    public editedOn: number;
    public revisionNote: string;
    public inputs: Array<CommandInputParameterModel | WorkflowInputParameterModel>;
    public appSettings: Array<CommandInputParameterModel | WorkflowInputParameterModel>;

    constructor(private system: SystemService) {

    }

    ngOnChanges(changes: SimpleChanges) {

        this.createdBy = this.model.customProps["sbg:createdBy"];
        this.createdOn = this.model.customProps["sbg:createdOn"] * 1000;
        this.editedBy = this.model.customProps["sbg:modifiedBy"];
        this.editedOn = this.model.customProps["sbg:modifiedOn"] * 1000;
        this.revisionNote = this.model.customProps["sbg:revisionNotes"] || null;


        this.inputs = (this.model.inputs as Array<CommandInputParameterModel
            | WorkflowInputParameterModel>)
            .filter((input) => input.type.type === "File" || input.type.items === "File");
        this.appSettings = (this.model.inputs as Array<CommandInputParameterModel
            | WorkflowInputParameterModel>)
            .filter((input) => input.type.type !== "File" && input.type.items !== "File");

    }

    updateLabel(value: string) {
        this.model.label = value;
        this.change.next();
    }

    updateDescription(value: string) {
        this.model.description = value;
        this.change.next();
    }

    updateCustomProp(key: string, value: any) {
        this.model.customProps[key] = value;
        this.change.next();
    }

    openWebPage(url: string) {
        this.system.openLink(url);
    }

    switchTab(tabName) {
        setTimeout(() => {
            this.viewMode = tabName;
        });
    }

    isToolkit() {
        return this.model instanceof CommandLineToolModel;
    }

}
