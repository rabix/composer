import {Component, Input, OnDestroy} from "@angular/core";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {Subscription} from "rxjs";
import {TabData} from "../workbox/tab-data.interface";
import {SettingsComponent} from "../settings";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ToolEditorComponent} from "../tool-editor/tool-editor.component";
import {WorkflowEditorComponent} from "../workflow-editor/workflow-editor.component";

@Component({
    selector: "ct-tab-manager",
    providers: [WebWorkerService],
    directives: [CodeEditorComponent, ToolEditorComponent, WorkflowEditorComponent, SettingsComponent],
    template: `
        <div [ngSwitch]="tab?.contentType | async" class="full-height">
            <ct-tool-editor *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
            <ct-workflow-editor [data]="tab.contentData" *ngSwitchCase="'Workflow'"></ct-workflow-editor>
            <ct-code-editor *ngSwitchCase="'Code'" 
                            [content]="tab.contentData.content" 
                            [language]="tab.contentData.language">
            </ct-code-editor>
            <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
            <block-loader *ngSwitchDefault></block-loader>
        </div>
    `
})
export class TabManagerComponent implements OnDestroy {

    @Input()
    public tab: TabData;

    private subs: Subscription[] = [];

    constructor(private webWorkerService: WebWorkerService) {}

    ngOnDestroy() {
        this.webWorkerService.dispose();
        this.subs.forEach(s => s.unsubscribe());
    }
}
