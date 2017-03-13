import {
    Component,
    Input,
    OnChanges,
    SimpleChanges
} from "@angular/core";
import {WorkflowModel} from "cwlts/models";
import {SystemService} from "../../../platform-providers/system.service";

@Component({
    selector: "ct-app-info",
    styleUrls: ["./app-info.component.scss"],
    template: `
      <div class="app-info">
          <div class="app-info-item app-info-header">
              <h3>
                  <ct-inline-editor  [value]="model.label"  label="Name" [required]="true" type="text" (saveData)="model.label = $event">
                      <h3>{{model.label}}</h3>
                  </ct-inline-editor>
              </h3>
              <div>Created by {{createdBy}} on {{createdOn | date}}. Last edited by {{editedBy}} on {{editedOn | date}}</div>
              <div *ngIf="revisionNote">Revision note: "{{revisionNote}}"</div>
          </div>
          <h3>Description:</h3>
          <ct-inline-editor [value]="model.description" label="Description" type="textarea" (saveData)="model.description = $event">
              <div class="app-info-item app-info-description" [ct-markdown]="model.description"></div>
          </ct-inline-editor>

          <div class="app-info-item app-info-meta">
              <div class="app-info-meta-item">
                  <ct-inline-editor [value]="model.customProps['sbg:categories']" label="Categories" type="tags" (saveData)="model.customProps['sbg:categories'] = $event">
                      <h4>Categories</h4>
                      <ul>
                          <li *ngFor="let cat of model.customProps['sbg:categories'];">{{cat}}</li>
                      </ul>
                  </ct-inline-editor>
              </div>
              <div class="app-info-meta-item">
                  <h4>Toolkit</h4>
                  <div>{{toolkit}}</div>
              </div>
              <div class="app-info-meta-item">
                  <ct-inline-editor  [value]="model.customProps['sbg:license']"  label="License" [required]="false" type="text" (saveData)="model.customProps['sbg:license'] = $event">
                      <h4>License</h4>
                      <div>{{model.customProps['sbg:license']}}</div>
                  </ct-inline-editor>
              </div>
              <div class="app-info-meta-item">
                  <ct-inline-editor [value]="model.customProps['sbg:contributors']" label="Contributors" type="tags" (saveData)="model.customProps['sbg:contributors'] = $event">
                      <h4>Contributors</h4>
                      <ul>
                          <li *ngFor="let contrib of model.customProps['sbg:contributors']">{{contrib}}</li>
                      </ul>
                  </ct-inline-editor>
              </div>
          </div>
          <div class="app-info-item app-info-links">
              <ct-inline-editor [value]="model.customProps['sbg:links']"  label="Links" [required]="true" type="keyvalue" (saveData)="model.customProps['sbg:links'] = $event">
                  <h3>Links</h3>
                  <ul>
                      <li *ngFor="let link of model.customProps['sbg:links']"><a href="" (click)="$event.preventDefault(); openWebPage(link.id)">{{link.label}}</a></li>
                  </ul>
              </ct-inline-editor>
          </div>
          <div class="app-info-item app-info-details">
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
                            <th scope="row">{{input.id}}</th>
                            <td>{{input.label}}</td>
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
                              <td>{{input.label}}</td>
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
export class AppInfoComponent implements OnChanges {
    @Input()
    model: WorkflowModel;

    public createdBy: string;
    public createdOn: number;
    public editedBy: string;
    public editedOn: number;
    public revisionNote: string;
    public toolkit: string;
    public inputs: Array<Object>;
    public appSettings: Array<Object>;

    constructor(private system: SystemService) {

    }

    ngOnChanges(changes: SimpleChanges) {
        this.createdBy = this.model.customProps['sbg:createdBy'];
        this.createdOn = this.model.customProps['sbg:createdOn'] * 1000;
        this.editedBy = this.model.customProps['sbg:modifiedBy'];
        this.editedOn = this.model.customProps['sbg:modifiedOn'] * 1000;
        this.revisionNote = this.model.customProps['sbg:revisionNotes'] || null;
        this.toolkit = this.model.customProps['sbg:toolkit'] + ' ' + this.model.customProps['sbg:toolkitVersion']

        this.inputs = this.model.inputs.filter((input) => input.type.type === 'File' || input.type.items === 'File');
        this.appSettings = this.model.inputs.filter((input) => input.type.type !== 'File' && input.type.items !== 'File');
    }


    private openWebPage(url: string) {
        this.system.openLink(url);
    }
}
