import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {Subscription, ReplaySubject} from "rxjs";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";
import {TabData} from "../workbox/tab-data.interface";
import {ToolEditorComponent} from "../tool-container/tool-container.component";
import {SettingsComponent} from "../settings";

@Component({
    selector: "ct-tab-manager",
    providers: [WebWorkerService],
    directives: [CodeEditorComponent, ToolEditorComponent, SettingsComponent],
    template: `
        <div [ngSwitch]="tab?.contentType | async" class="full-height">
            <ct-tool-editor *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
            <!--<ct-workflow-editor [fileStream]="tab" *ngSwitchCase="'Workflow'"></ct-workflow-editor>-->
            <ct-code-editor *ngSwitchCase="'Code'" 
                            [content]="tab.contentData.content" 
                            [language]="tab.contentData.language" 
                            >
            </ct-code-editor>
            <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
            <block-loader *ngSwitchDefault></block-loader>
        </div>
    `
})
export class TabManagerComponent implements OnInit, OnDestroy {

    @Input()
    public tab: TabData;

    private webWorkerService: WebWorkerService;
    private validationStream: ReplaySubject<ValidationResponse>;

    private subs: Subscription[] = [];

    constructor(private webWorkerService: WebWorkerService) {
    }


    ngOnInit() {

        // this.subs.push(this.webWorkerService.validationResultStream.subscribe(val => {
        //     switch (val.class) {
        //         case "CommandLineTool":
        //             this.type = "tool";
        //             break;
        //         case "Workflow":
        //             this.type = "workflow";
        //             break;
        //         default:
        //             this.type = "text";
        //             break;
        //     }
        //
        //     this.isLoading = false;
        // }));

        // this.subs.push(this.tab.subscribe(file => {
        //     this.webWorkerService.validateJsonSchema(file.tabData);
        // }));
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
        // this.webWorkerService.dispose();
    }
}
