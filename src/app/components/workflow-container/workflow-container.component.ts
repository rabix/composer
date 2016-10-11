import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {FileModel} from "../../store/models/fs.models";
import {Observable, Subscription, ReplaySubject} from "rxjs";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";

@Component({
    selector: 'workflow-container',
    directives: [CodeEditorComponent],
    template: `<block-loader *ngIf="!isLoaded"></block-loader>

<div class="tool-container-component" *ngIf="isLoaded">
    <tool-header class="tool-header"></tool-header>

    <div class="scroll-content">
        <code-editor *ngIf="(viewMode | async) === 'json'" [fileStream]="fileStream"></code-editor>
        <div class="gui-editor-component" *ngIf="(viewMode | async) === 'gui'">
            Workflow Editor Coming Soon
        </div>
    </div>

    <div class="status-bar-footer">
        <div class="left-side">
            <validation-issues [issuesStream]="schemaValidationStream"></validation-issues>
        </div>
        <div class="right-side">
            <!--<view-switcher [viewMode]="viewMode" [disabled]="!isValid"></view-switcher>-->
        </div>
    </div>
</div>
`
})
export class WorkflowContainerComponent implements OnInit, OnDestroy {
    @Input()
    public fileStream: Observable<FileModel>;

    @Input()
    public schemaValidationStream: ReplaySubject<ValidationResponse>;

    /** Default view mode */
    private viewMode: ReplaySubject<'json' | 'gui'>;

    private subs: Subscription[] = [];

    /** File that we will pass to both the gui and JSON editor */
    private file: FileModel;

    /** Flag for validity of CWL document */
    private isValid: boolean;

    private isLoaded = false;

    constructor() {
        this.viewMode = new ReplaySubject<'json' | 'gui'>();
        this.viewMode.next('json');
    }

    ngOnInit() {
        this.subs.push(this.fileStream.subscribe(file => {
            this.file     = file;
            this.isLoaded = true;
        }));

        // enable GUI switch when file is valid CWL
        this.subs.push(this.schemaValidationStream.subscribe((err: ValidationResponse) => {
            this.isValid = err.isValidCwl;
        }));

    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}