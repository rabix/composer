import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {Subscription, ReplaySubject, BehaviorSubject} from "rxjs";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {DataEntrySource} from "../../sources/common/interfaces";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";

@Component({
    selector: 'ct-workflow-editor',
    directives: [CodeEditorComponent],
    template: `
        <div class="editor-container">
            <tool-header class="editor-header"></tool-header>
        
            <div class="scroll-content">
                <ct-code-editor [hidden]="viewMode !== 'code'"
                                (contentChanges)="onEditorContentChange($event)"
                                [content]="data.content"
                                [language]="data.language">
                </ct-code-editor>
        
                <div>Workflow Editor Coming Soon</div>
            </div>
        
            <div class="status-bar-footer">
                <div class="left-side">
                    <validation-issues [issuesStream]="schemaValidation"></validation-issues>
                </div>
                <div class="right-side">
                    <ct-view-mode-switch [viewMode]="viewMode"
                                         [disabled]="!guiAvailable"
                                         (onSwitch)="viewMode = $event">
                    </ct-view-mode-switch>
                </div>
            </div>
        </div>
`
})
export class WorkflowEditorComponent implements OnInit, OnDestroy {
    @Input()
    public data: DataEntrySource;

    public schemaValidation = new ReplaySubject<ValidationResponse>(1);

    /** Default view mode. */
    private viewMode: "code"|"gui" = "code";

    /** Flag for validity of CWL document */
    private guiAvailable = true;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[] = [];

    private rawEditorContent = new BehaviorSubject("");

    constructor(private webWorkerService: WebWorkerService) {

    }

    ngOnInit(): void {

        this.data.content.subscribe(this.rawEditorContent);

        this.webWorkerService.validationResultStream
            .subscribe(this.schemaValidation);

        this.webWorkerService.validationResultStream.subscribe(err => {
            this.guiAvailable = err.isValidCwl;
        });
    }

    private onEditorContentChange(content: string) {
        this.webWorkerService.validateJsonSchema(content);
        this.rawEditorContent.next(content);

    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}