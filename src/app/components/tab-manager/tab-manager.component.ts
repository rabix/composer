import {Component, OnInit, Input} from "@angular/core";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {ToolContainerComponent} from "../tool-container/tool-container.component";
import {Observable, Subscription} from "rxjs";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";

@Component({
    selector: "tab-manager",
    providers: [WebWorkerService],
    directives: [CodeEditorComponent, ToolContainerComponent],
    template: `
        <block-loader *ngIf="isLoading"></block-loader>
        
        <div [ngSwitch]="type" style="height: 100%">
            <tool-container [fileStream]="file" *ngSwitchCase="'tool'"></tool-container>
            <h1 *ngSwitchCase="'workflow'">Workflow Editor coming soon</h1>
            <code-editor [fileStream]="file" *ngSwitchCase="'text'"></code-editor>
        </div>
`
})
export class TabManagerComponent implements OnInit, OnDestroy {

    @Input()
    private file: Observable<FileModel>;

    private type: "text" | "workflow" | "tool";

    private webWorkerService: WebWorkerService;

    private isLoading = true;

    private subs: Subscription[] = [];

    constructor(private fileRegistry: FileRegistry,
                private webWorkerService: WebWorkerService) { }

    ngOnInit() {

        this.subs.push(this.webWorkerService.validationResultStream.subscribe(val => {
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
