import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {ToolContainerComponent} from "../tool-container/tool-container.component";
import {Observable, Subscription, ReplaySubject} from "rxjs";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {WorkflowContainerComponent} from "../workflow-container/workflow-container.component";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";

@Component({
    selector: "tab-manager",
    providers: [WebWorkerService],
    directives: [CodeEditorComponent, ToolContainerComponent, WorkflowContainerComponent],
    template: `
<block-loader *ngIf="isLoading"></block-loader>

<div [ngSwitch]="type" style="height: 100%">
    <tool-container [fileStream]="file" *ngSwitchCase="'tool'" [schemaValidationStream]="validationStream"></tool-container>
    <workflow-container [fileStream]="file" *ngSwitchCase="'workflow'" [schemaValidationStream]="validationStream"></workflow-container>
    <code-editor [fileStream]="file" *ngSwitchCase="'text'"></code-editor>
</div>`
})
export class TabManagerComponent implements OnInit, OnDestroy {

    @Input()
    private file: Observable<FileModel>;

    private type: "text" | "workflow" | "tool" = "text";

    private webWorkerService: WebWorkerService;
    private validationStream: ReplaySubject<ValidationResponse>;
    private isLoading = true;

    private subs: Subscription[] = [];

    constructor(private webWorkerService: WebWorkerService) { }

    ngOnInit() {

        this.validationStream = new ReplaySubject();
        this.webWorkerService.validationResultStream.subscribe(this.validationStream);


        this.subs.push(this.webWorkerService.validationResultStream
            .filter(val => val.isValidJSON) // only switch views if JSON is valid to avoid jerky interface
            .subscribe(val => {
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
        }));

        this.subs.push(this.file.subscribe(file => {
            this.webWorkerService.validateJsonSchema(file.content);
        }));
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
        this.webWorkerService.dispose();
    }
}
