import {
    Component,
    Input,
    OnChanges,
    SimpleChanges
} from "@angular/core";
import {WorkflowModel} from "cwlts/models";
import {SystemService} from "../../../platform-providers/system.service";
import {
    CommandInputParameterModel,
    WorkflowInputParameterModel,
    CommandLineToolModel
} from "cwlts/models";

@Component({
    selector: "ct-app-info",
    styleUrls: ["./app-info.component.scss"],
    template: `
        <div class="app-info">

            <!--Header section-->
            <div class="info-section">
                <ct-inline-editor [value]="model.label" type="text"
                                  [disabled]="readonly"
                                  (saveData)="model.label = $event">

                    <h1 class="h3">{{model.label}}</h1>
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
                                  (saveData)="model.description = $event">
                    <div [ct-markdown]="model.description"></div>
                </ct-inline-editor>
            </div>

            <!--Meta section-->
            <div class="info-section">
                <div class="app-info-meta">

                    <!--Categories-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Categories:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:categories']"
                                          type="tags"
                                          [disabled]="readonly"
                                          [options]="categories"
                                          (saveData)="model.customProps['sbg:categories'] = $event">
                            {{ (model.customProps['sbg:categories'] || []).join(", ")}}
                        </ct-inline-editor>
                    </div>

                    <!--Toolkit-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Toolkit:</div>
                        <div>
                            <ct-inline-editor [disabled]="readonly" class="toolkit"
                                              [value]="model.customProps['sbg:toolkit']"
                                              type="text"
                                              (saveData)="model.customProps['sbg:toolkit'] = $event">
                                {{model.customProps['sbg:toolkit']}}
                            </ct-inline-editor>
                            <ct-inline-editor class="toolkit"
                                              [disabled]="readonly"
                                              [value]="model.customProps['sbg:toolkitVersion']"
                                              type="text"
                                              (saveData)="model.customProps['sbg:toolkitVersion'] = $event">
                                {{model.customProps['sbg:toolkitVersion']}}
                            </ct-inline-editor>
                        </div>
                    </div>

                    <!--License-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">License:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:license']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="model.customProps['sbg:license'] = $event">
                            <div>{{model.customProps['sbg:license']}}</div>
                        </ct-inline-editor>
                    </div>

                    <!--Wrapper Author-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Wrapper Author:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:wrapperAuthor']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="model.customProps['sbg:wrapperAuthor'] = $event">
                            <div>{{model.customProps['sbg:wrapperAuthor']}}</div>
                        </ct-inline-editor>
                    </div>

                    <!--Wrapper License-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Wrapper License:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:wrapperLicense']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="model.customProps['sbg:wrapperLicense'] = $event">
                            <div>{{model.customProps['sbg:wrapperLicense']}}</div>
                        </ct-inline-editor>
                    </div>

                    <!--Author-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Author:</div>
                        <ct-inline-editor [value]="model.customProps['sbg:toolAuthor']"
                                          [disabled]="readonly"
                                          type="text"
                                          (saveData)="model.customProps['sbg:toolAuthor'] = $event">
                            {{model.customProps['sbg:toolAuthor']}}
                        </ct-inline-editor>
                    </div>

                    <!--Contributors-->
                    <div class="col-lg-4 col-sm-6 app-info-meta-item">
                        <div class="text-title">Contributors:</div>
                        {{(model.customProps['sbg:contributors'] || []).join(", ")}}
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
                                          (saveData)="model.customProps['sbg:links'] = $event">

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

            <!--Table section-->
            <div class="info-section">

                <ct-tab-selector distribute="auto" [active]="viewMode" (activeChange)="switchTab($event)">
                    <ct-tab-selector-entry tabName="inputs">Inputs</ct-tab-selector-entry>
                    <ct-tab-selector-entry tabName="appSettings">App Settings</ct-tab-selector-entry>
                    <ct-tab-selector-entry tabName="outputs">Outputs</ct-tab-selector-entry>
                </ct-tab-selector>


                <!--Inputs-->
                <div *ngIf="viewMode === 'inputs'">
                    <div *ngIf="inputs.length === 0">
                        No inputs.
                    </div>
                    <table class="table" *ngIf="inputs.length > 0">
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
                    <div *ngIf="appSettings.length === 0">
                        No settings.
                    </div>
                    <table class="table" *ngIf="appSettings.length > 0">
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
                    <div *ngIf="model.outputs.length === 0">
                        No outputs.
                    </div>
                    <table class="table">
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

        this.createdBy    = this.model.customProps["sbg:createdBy"];
        this.createdOn    = this.model.customProps["sbg:createdOn"] * 1000;
        this.editedBy     = this.model.customProps["sbg:modifiedBy"];
        this.editedOn     = this.model.customProps["sbg:modifiedOn"] * 1000;
        this.revisionNote = this.model.customProps["sbg:revisionNotes"] || null;


        this.inputs      = (this.model.inputs as Array<CommandInputParameterModel
            | WorkflowInputParameterModel>)
            .filter((input) => input.type.type === "File" || input.type.items === "File");
        this.appSettings = (this.model.inputs as Array<CommandInputParameterModel
            | WorkflowInputParameterModel>)
            .filter((input) => input.type.type !== "File" && input.type.items !== "File");
    }


    openWebPage(url: string) {
        this.system.openLink(url);
    }

    switchTab(tabName) {
        setTimeout(() => {
            this.viewMode = tabName;
        });
    }
}
