import {Component, Input} from "@angular/core";
import {TabData} from "../workbox/tab-data.interface";
import {SettingsComponent} from "../settings";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ToolEditorComponent} from "../tool-editor/tool-editor.component";
import {WorkflowEditorComponent} from "../workflow-editor/workflow-editor.component";
import {StandaloneCodeEditorComponent} from "../standalone-code-editor/standalone-code-editor.component";

@Component({
    selector: "ct-tab-manager",
    providers: [WebWorkerService],
    directives: [
        StandaloneCodeEditorComponent,
        ToolEditorComponent,
        WorkflowEditorComponent,
        SettingsComponent
    ],
    template: `
        <div [ngSwitch]="tab?.contentType | async" class="full-height">
            <ct-tool-editor *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
            <ct-workflow-editor [data]="tab.contentData" *ngSwitchCase="'Workflow'"></ct-workflow-editor>
            <ct-standalone-code-editor [data]="tab.contentData" *ngSwitchCase="'Code'"></ct-standalone-code-editor>
            <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
            <block-loader *ngSwitchDefault></block-loader>
        </div>
    `
})
export class TabManagerComponent {
    @Input()
    public tab: TabData;
}
