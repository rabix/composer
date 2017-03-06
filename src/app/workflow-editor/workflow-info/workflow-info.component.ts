import {
    Component,
    Input,
    OnChanges,
    SimpleChanges
} from "@angular/core";
import {WorkflowModel} from "cwlts/models";
import {SystemService} from "../../platform-providers/system.service";


@Component({
    selector: "ct-workflow-info",
    styleUrls: ["./workflow-info.component.scss"],
    template: `
      <div class="workflow-info">
        <div class="workflow-info-item workflow-header">
          <h3>{{model.label}}</h3>
          <div>Created by {{createdBy}} on {{createdOn | date}}. Last edited by {{editedBy}} on {{editedOn | date}}</div>
          <div>Revision note: "{{revisionNote}}"</div>
        </div>
        <h3>Description:</h3>
        <div class="workflow-info-item workflow-description" [ct-markdown]="model.description"></div>
        <div class="workflow-info-item workflow-meta">
          <div class="workflow-meta-item">
            <h4>Categories</h4>
            <ul>
              <li *ngFor="let cat of categories;">{{cat}}</li>
            </ul>
          </div>
          <div class="workflow-meta-item">
            <h4>Toolkit</h4>
            <div>{{toolkit}}</div>
          </div>
          <div class="workflow-meta-item">
            <h4>License</h4>
            <div>{{model.customProps['sbg:license']}}</div>
          </div>
          <div class="workflow-meta-item">
            <h4>Contributors</h4>
            <ul>
              <li *ngFor="let contrib of contributors">{{contrib}}</li>
            </ul>
          </div>
        </div>
        <div class="workflow-info-item workflow-links">
          <h3>Links</h3>
          <ul>
            <li *ngFor="let link of links"><a href="" (click)="$event.preventDefault(); openWebPage(link.id)">{{link.label}}</a></li>
          </ul>
        </div>
        <div class="workflow-info-item workflow-details">
          <ct-tabs-component>
            <ct-tab-component tabTitle="Inputs">
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
                  <th scope="row">{{input.idp}}</th>
                  <td>{{input.customProps.label}}</td>
                  <td>{{input.type | commandParameterType}}</td>
                  <td>{{input.type.isNullable ? 'False' : 'True'}}</td>
                  <td>prefix</td>
                  <td>format</td>
                </tr>
              </table>
            </ct-tab-component>
            <ct-tab-component tabTitle="App Settings">
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
                    <th scope="row">{{input.id}}</th>
                    <td>{{input.customProps.label}}</td>
                    <td>{{input.type | commandParameterType}}</td>
                    <td>{{input.type.isNullable ? 'False' : 'True'}}</td>
                    <td>prefix</td>
                    <td>format</td>
                  </tr>
              </table>
            </ct-tab-component>
            <ct-tab-component tabTitle="Outputs">
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
                    <th scope="row">{{output.id}}</th>
                    <td>{{output.label}}</td>
                    <td>{{output.type | commandParameterType}}</td>
                    <td>format</td>
                  </tr>
              </table>
            </ct-tab-component>
          </ct-tabs-component>
        </div>
      </div>
    `
})
export class WorkflowInfoComponent implements OnChanges {
    @Input()
    model: WorkflowModel;

    private createdBy: string;
    private createdOn: number;
    private editedBy: string;
    private editedOn: number;
    private revisionNote: string;
    private categories: Array<string>;
    private toolkit: string;
    private contributors: Array<string>;
    private links: Array<Object>;
    private inputs: Array<Object>;
    private appSettings: Array<Object>;

    constructor(private system: SystemService) {

    }

    ngOnChanges(changes: SimpleChanges) {

        console.log('wf model', this.model);

        this.createdBy = this.model.customProps['sbg:createdBy'];
        this.createdOn = this.model.customProps['sbg:createdOn'] * 1000;
        this.editedBy = this.model.customProps['sbg:modifiedBy'];
        this.editedOn = this.model.customProps['sbg:modifiedOn'] * 1000;
        this.revisionNote = this.model.customProps['sbg:revisionNotes'];
        this.categories = this.model.customProps['sbg:categories'];
        this.toolkit = this.model.customProps['sbg:toolkit'] + ' ' + this.model.customProps['sbg:toolkitVersion']
        this.contributors = this.model.customProps['sbg:contributors'];
        this.links = this.model.customProps['sbg:links'];

        this.inputs = this.model.inputs.filter((input) => input.type.type === 'File' || input.type.items === 'File');
        this.appSettings = this.model.inputs.filter((input) => input.type.type !== 'File' && input.type.items !== 'File');
    }


    private openWebPage(url: string) {
        this.system.openLink(url);
    }
}
