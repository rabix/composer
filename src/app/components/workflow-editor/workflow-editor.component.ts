import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {ReplaySubject, BehaviorSubject, Subscription} from "rxjs";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {DataEntrySource} from "../../sources/common/interfaces";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ViewMode} from "../view-switcher/view-switcher.component";
import {ComponentBase} from "../common/component-base";
import {noop} from "../../lib/utils.lib";

@Component({
    selector: 'ct-workflow-editor',
    template: `
        <div class="editor-container">
            <tool-header class="editor-header"
                         (save)="save($event)"
                         [fileIsValid]="isValidCWL"
                         [data]="data"></tool-header>
        
            <div class="scroll-content">
                         <ct-code-editor [hidden]="viewMode !== __viewModes.Code"
                             class="editor flex-fill"
                             [content]="rawEditorContent"
                             [readonly]="!data.isWritable"
                             [language]="data.language | async"></ct-code-editor>
        
                <div [hidden]="viewMode !== __viewModes.Gui">
                    Workflow Editor Coming Soon
                </div>
            </div>
        
            <div class="status-bar-footer">
                <div class="left-side">
                    <validation-issues [issuesStream]="schemaValidation" [show]="showValidation" (select)="showValidation = !showValidation"></validation-issues>
                </div>
                <div class="right-side">
                    <ct-view-mode-switch [viewMode]="viewMode"
                                         [disabled]="!isValidCWL"
                                         (switch)="viewMode = $event"></ct-view-mode-switch>
                </div>
            </div>
        </div>
`
})
export class WorkflowEditorComponent extends ComponentBase implements OnInit, OnDestroy {
    @Input()
    public data: DataEntrySource;

    public schemaValidation = new ReplaySubject<ValidationResponse>(1);

    /** Default view mode. */
    private viewMode = ViewMode.Code;

    /** Flag for validity of CWL document */
    private isValidCWL = true;

    /** Flag for showing validation panel. Because it is currently the only panel, there is a flag
     *  otherwise, WF editor should have same implementation as Tool editor */
    private showValidation = false;

    private rawEditorContent = new BehaviorSubject<string>("");

    private __viewModes = ViewMode;

    private saveSubscription: Subscription;

    constructor(private webWorkerService: WebWorkerService) {
        super();
    }

    ngOnInit(): void {

        this.tracked = this.rawEditorContent
            .skip(1)
            .distinctUntilChanged()
            .subscribe(latestContent => {
                this.webWorkerService.validateJsonSchema(latestContent);
            });

        this.tracked = this.data.content.subscribe(val => {
            this.rawEditorContent.next(val);
        });

        this.tracked = this.webWorkerService.validationResultStream
            .subscribe(this.schemaValidation);

        this.tracked = this.webWorkerService.validationResultStream.subscribe(err => {
            this.isValidCWL = err.isValidCwl;
        });
    }

    private save(revisionNote): void {
        this.clearSaveSubscription();

        if (this.data.data.source === "local") {
            this.saveSubscription = this.data.data.save(this.rawEditorContent.getValue()).subscribe(noop);
        } else {
            this.saveSubscription = this.data.save(JSON.parse(this.rawEditorContent.getValue()), revisionNote).subscribe(noop);
        }
    }

    private clearSaveSubscription(): void {
        if (!!this.saveSubscription) {
            this.saveSubscription.unsubscribe();
        }
    }

    ngOnDestroy(): void {
        this.webWorkerService.disposeJsonSchemaWorker();
        this.clearSaveSubscription();
        super.ngOnDestroy();
    }
}
