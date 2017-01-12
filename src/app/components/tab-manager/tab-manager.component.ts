import {Component, Input, OnChanges, SimpleChanges, ViewChildren, QueryList} from "@angular/core";
import {TabData} from "../workbox/tab-data.interface";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {StatusControlProvider} from "../../core/status-bar/status-control-provider.interface";

@Component({
    selector: "ct-tab-manager",
    providers: [WebWorkerService],
    template: `
        <div [ngSwitch]="tab?.contentType | async" class="full-height">
            <ct-tool-editor #component *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
            <ct-workflow-editor #component [data]="tab.contentData" *ngSwitchCase="'Workflow'"></ct-workflow-editor>
            <ct-file-editor [data]="tab.contentData" *ngSwitchCase="'Code'"></ct-file-editor>
            <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
            <block-loader *ngSwitchDefault></block-loader>
        </div>
    `
})
export class TabManagerComponent implements OnChanges {
    @Input()
    public tab: TabData<any>;

    @ViewChildren("component")
    private tabComponent: QueryList<StatusControlProvider>;

    ngAfterViewInit() {
        console.log("Tab component query", this.tabComponent);
        this.tabComponent.changes.subscribe((value) => {
            console.log("Value of tab component", value)
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log("TAb component", this.tabComponent);
    }
}
