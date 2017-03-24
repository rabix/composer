import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ct-layout-tab-content',
  template: `
      <div [ngSwitch]="tab?.contentType | async" class="full-height">
          <ct-tool-editor #tabComponent *ngSwitchCase="'CommandLineTool'"
                          [data]="tab.contentData"></ct-tool-editor>
          <ct-workflow-editor #tabComponent [data]="tab.contentData"
                              *ngSwitchCase="'Workflow'"></ct-workflow-editor>
          <ct-file-editor [data]="tab.contentData" *ngSwitchCase="'Code'"></ct-file-editor>
          <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
          <ct-line-loader *ngSwitchDefault></ct-line-loader>
      </div>
  `,
  styleUrls: ['./layout-tab-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutTabContentComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
