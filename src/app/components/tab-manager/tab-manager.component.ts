import {Component} from '@angular/core';
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {FileModel} from "../../store/models/fs.models";
import {FileRegistry} from "../../services/file-registry.service";
import {Observable, ReplaySubject} from "rxjs";
import {ToolContainerComponent} from "../tool-container/tool-container.component";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {WorkflowContainerComponent} from "../workflow-container/workflow-container.component";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";

@Component({
    selector: 'tab-manager',
    directives: [CodeEditorComponent, ToolContainerComponent, WorkflowContainerComponent],
    template: `
<block-loader *ngIf="isLoading"></block-loader>

<div [ngSwitch]="type" style="height: 100%">
    <tool-container [fileStream]="fileStream" *ngSwitchCase="'tool'" [schemaValidationStream]="validationStream"></tool-container>
    <workflow-container [fileStream]="fileStream" *ngSwitchCase="'workflow'"></workflow-container>
    <code-editor [fileStream]="fileStream" *ngSwitchCase="'text'"></code-editor>
</div>`
})
export class TabManagerComponent implements DynamicState {
    private fileStream: Observable<FileModel>;
    private type: "text" | "workflow" | "tool";
    private webWorkerService: WebWorkerService;
    private validationStream: ReplaySubject<ValidationResponse>;
    private isLoading = true;

    constructor(private fileRegistry: FileRegistry) {
        this.webWorkerService = new WebWorkerService();
    }

    setState(state) {
        this.fileStream = this.fileRegistry.getFile(state.fileInfo);

        this.validationStream = new ReplaySubject();
        this.webWorkerService.validationResultStream.subscribe(this.validationStream);

        this.webWorkerService.validationResultStream.first().subscribe(val => {
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