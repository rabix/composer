import {Component, OnInit} from '@angular/core';
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {ToolContainerComponent} from "../tool-container/tool-container.component";
import {FileRegistry} from "../../services/file-registry.service";
import {Observable} from "rxjs";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";

@Component({
    moduleId: module.id,
    selector: 'tab-manager',
    directives: [CodeEditorComponent, ToolContainerComponent],
    template: `
<block-loader *ngIf="isLoading"></block-loader>

<div [ngSwitch]="type" style="height: 100%">
<tool-container [fileStream]="fileStream" *ngSwitchCase="'tool'"></tool-container>
<h1 *ngSwitchCase="'workflow'">Workflow Editor coming soon</h1>
<code-editor [fileStream]="fileStream" *ngSwitchCase="'text'"></code-editor>

</div>`
})
export class TabManagerComponent implements OnInit, DynamicState {
    private fileStream: Observable<FileModel>;
    private type: "text" | "workflow" | "tool";
    private webWorkerService: WebWorkerService;
    private isLoading = true;

    constructor(private fileRegistry: FileRegistry) {
        this.webWorkerService = new WebWorkerService();
    }

    ngOnInit() {
    }

    setState(state) {
        this.fileStream = this.fileRegistry.getFile(state.fileInfo);

        this.webWorkerService.validationResultStream.subscribe(val => {
            switch (val.class) {
                case "CommandLineTool":
                    this.type = "tool";
                    break;
                case "Workflow":
                    this.type = "workflow";
                    break;
                default:
                    this.type = "text";
                    break;
            }

            this.isLoading = false;
        });

        this.fileStream.subscribe(file => {
            this.webWorkerService.validateJsonSchema(file.content);
        });
    }

}