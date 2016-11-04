import {Component, Input, OnDestroy, ChangeDetectionStrategy} from "@angular/core";
import {Subscription} from "rxjs";
import {TabData} from "../workbox/tab-data.interface";
import {SettingsComponent} from "../settings";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ToolEditorComponent} from "../tool-editor/tool-editor.component";
import {WorkflowEditorComponent} from "../workflow-editor/workflow-editor.component";
import {StandaloneCodeEditorComponent} from "../standalone-code-editor/standalone-code-editor.component";
import {FormControl} from "@angular/forms";
import {ExpressionModel} from "cwlts";
import {ExpressionSidebarService} from "../../services/sidebars/expression-sidebar.service";
import {ToolSidebarService} from "../../services/sidebars/tool-sidebar.service";
import {InputSidebarService} from "../../services/sidebars/input-sidebar.service";

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
    <!--<input class="form-control" [formControl]="ctrl" [value]="ctrl.value.toString()">-->
    <!--{{ ctrl.value | json }}-->
    <!--<button class="btn btn-primary" (click)="update()">Update</button>-->

<!--<expression-input [control]="ctrl" ></expression-input>-->

        <div [ngSwitch]="tab?.contentType | async" class="full-height">
            <ct-tool-editor *ngSwitchCase="'CommandLineTool'" [data]="tab.contentData"></ct-tool-editor>
            <ct-workflow-editor [data]="tab.contentData" *ngSwitchCase="'Workflow'"></ct-workflow-editor>
            <ct-standalone-code-editor [data]="tab.contentData" *ngSwitchCase="'Code'"></ct-standalone-code-editor>
            <ct-settings *ngSwitchCase="'Settings'"></ct-settings>
            <block-loader *ngSwitchDefault></block-loader>
        </div>
                
        <!--<sidebar-component></sidebar-component>-->
    `
})
export class TabManagerComponent implements OnDestroy {
    counter = 0;
    ctrl = new FormControl(new ExpressionModel({script: "no cats", engine: "#cwl-js-engine", class: "Expression"}));

    update() {
        this.counter++;
        const newexpr = new ExpressionModel({script: this.counter + " cats", engine: "#cwl-js-engine", class: "Expression"});
        this.ctrl.setValue(newexpr)
    }

    @Input()
    public tab: TabData;

    private subs: Subscription[] = [];

    constructor(private webWorkerService: WebWorkerService) {}

    ngOnDestroy() {
        this.webWorkerService.dispose();
        this.subs.forEach(s => s.unsubscribe());
    }
}
