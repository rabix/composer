import {Component, Input} from "@angular/core";
import {TabData} from "../workbox/tab-data.interface";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";

@Component({
    selector: "ct-tab-manager",
    providers: [WebWorkerService],
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
    public tab: TabData<any>;

    constructor(){
        console.log("Constructing a tab thing");
    }
}
