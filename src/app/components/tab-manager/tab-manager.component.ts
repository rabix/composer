import {Component, Input} from "@angular/core";
import {TabData} from "../workbox/tab-data.interface";
import {SettingsComponent} from "../settings";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ToolEditorComponent} from "../tool-editor/tool-editor.component";
import {WorkflowEditorComponent} from "../workflow-editor/workflow-editor.component";
import {FileEditorComponent} from "../file-editor/file-editor.component";

@Component({
    selector: "ct-tab-manager",
    providers: [WebWorkerService],
    directives: [
        FileEditorComponent,
        ToolEditorComponent,
        WorkflowEditorComponent,
        SettingsComponent
    ],
    template: `
        <div [ngSwitch]="tab?.contentType | async" class="full-height">
            <ct-tool-editor *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
            <ct-workflow-editor [data]="tab.contentData" *ngSwitchCase="'Workflow'"></ct-workflow-editor>
            <ct-file-editor [data]="tab.contentData" *ngSwitchCase="'Code'"></ct-file-editor>
            <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
            <block-loader *ngSwitchDefault></block-loader>
        </div>
    `
})
export class TabManagerComponent {
    @Input()
    public tab: TabData;
}
