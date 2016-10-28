import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {CltEditorComponent} from "../clt-editor/clt-editor.component";
import {Subscription, ReplaySubject, BehaviorSubject} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
import {ViewModeService} from "./services/view-mode.service";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {CommandLineComponent} from "../clt-editor/commandline/commandline.component";
import {ViewModeSwitchComponent} from "../view-switcher/view-switcher.component";
import {DataEntrySource} from "../../sources/common/interfaces";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {ValidationIssuesComponent} from "../validation-issues/validation-issues.component";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ToolSidebarService} from "../../services/sidebars/tool-sidebar.service";

import {ExpressionSidebarService} from "../../services/sidebars/expression-sidebar.service";
import {InputSidebarService} from "../../services/sidebars/input-sidebar.service";


require("./tool-editor.component.scss");

@Component({
    selector: "ct-tool-editor",
    providers: [ViewModeService, ToolSidebarService, ExpressionSidebarService, InputSidebarService],
    directives: [
        CodeEditorComponent,
        CltEditorComponent,
        BlockLoaderComponent,
        ToolHeaderComponent,
        CommandLineComponent,
        SidebarComponent,
        ViewModeSwitchComponent,
        ValidationIssuesComponent
    ],
    template: `
        <div class="editor-container">
            <tool-header class="editor-header"
                         (save)="save($event)"
                         [fileIsValid]="isValidCWL"
                         [data]="data"></tool-header>
        
            <div class="scroll-content">
                <ct-code-editor [hidden]="viewMode !== 'code'"
                                (contentChanges)="onEditorContentChange($event)"
                                [content]="rawEditorContent"
                                [readOnly]="!data.isWritable"
                                [language]="data.language">
                </ct-code-editor>
        
                <ct-clt-editor *ngIf="viewMode === 'gui'"
                               class="gui-editor-component"
                               [model]="toolModel">
                </ct-clt-editor>
            </div>
            <div class="status-bar-footer">
                <div class="left-side">
                    <validation-issues [issuesStream]="schemaValidation" (select)="selectBottomPanel($event)" [show]="bottomPanel === 'validation'"></validation-issues>
                    <commandline [commandLineParts]="commandLineParts" (select)="selectBottomPanel($event)" [show]="bottomPanel === 'commandLine'"></commandline>
                </div>
                <div class="right-side">
                    <ct-view-mode-switch [viewMode]="viewMode"
                                         [disabled]="!isValidCWL"
                                         (switch)="switchView($event)">
                    </ct-view-mode-switch>
                </div>
            </div>
        </div>
    `
})
export class ToolEditorComponent implements OnInit, OnDestroy {
    @Input()
    public data: DataEntrySource;

    public schemaValidation = new ReplaySubject<ValidationResponse>(1);

    /** Default view mode. */
    private viewMode: "code"|"gui" = "code";

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    //@todo(maya) consider using ct-panel-switcher instead
    private bottomPanel: "validation"|"commandLine"|null;

    private toolModel = new CommandLineToolModel();

    private commandLineParts: CommandLinePart[];

    /** Flag for validity of CWL document */
    private isValidCWL = false;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[] = [];

    private rawEditorContent = new BehaviorSubject("");

    constructor(private webWorkerService: WebWorkerService) {

    }

    ngOnInit(): void {

        this.data.content.subscribe(this.rawEditorContent);

        this.webWorkerService.validationResultStream
            .subscribe(this.schemaValidation);

        this.rawEditorContent.subscribe(raw => {
            try {
                this.toolModel        = new CommandLineToolModel(JSON.parse(raw));
                this.commandLineParts = this.toolModel.getCommandLineParts();
            } catch (ex) {
                // if the file isn't valid JSON, do nothing
            }
        });

        this.webWorkerService.validationResultStream.subscribe(err => {
            this.isValidCWL = err.isValidCwl;
        });
    }

    private onEditorContentChange(content: string) {
        this.webWorkerService.validateJsonSchema(content);
        this.rawEditorContent.next(content);
    }

    private save(revisionNote) {

        if (this.data.data.source === "local") {
            this.data.data.save(this.rawEditorContent.getValue()).subscribe(_ => {
            });
        } else {
            this.data.save(JSON.parse(this.rawEditorContent.getValue()), revisionNote).subscribe(data => {
            });
        }
    }

    private switchView(ev) {
        this.viewMode = ev;
        if (ev === "code") {
            this.rawEditorContent.next(JSON.stringify(this.toolModel.serialize(), null, 4));
        }
    }

    private selectBottomPanel(panel: "validation"|"commandLineTool") {
        this.bottomPanel = this.bottomPanel === panel ? null : panel;
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
