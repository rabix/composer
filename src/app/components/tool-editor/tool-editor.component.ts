import * as Yaml from "js-yaml";
import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {FormGroup, FormBuilder} from "@angular/forms";
import {ReplaySubject, BehaviorSubject} from "rxjs/Rx";

import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {ReplaySubject, BehaviorSubject, Observable} from "rxjs/Rx";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {DataEntrySource} from "../../sources/common/interfaces";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ToolSidebarService} from "../../services/sidebars/tool-sidebar.service";
import {ExpressionSidebarService} from "../../services/sidebars/expression-sidebar.service";
import {InputSidebarService} from "../../services/sidebars/input-sidebar.service";
import {ModalService} from "../modal";
import {ComponentBase} from "../common/component-base";
import {noop} from "../../lib/utils.lib";
import {ToolSidebarService} from "../../services/sidebars/tool-sidebar.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {ViewMode} from "../view-switcher/view-switcher.component";

require("./tool-editor.component.scss");

@Component({
    selector: "ct-tool-editor",
    providers: [
        ToolSidebarService,
        ExpressionSidebarService,
        InputSidebarService,
        ModalService
    ],
    template: `
        <block-loader *ngIf="isLoading"></block-loader>

        <div class="editor-container" *ngIf="!isLoading">
            <tool-header class="editor-header"
                         (save)="save($event)"
                         [fileIsValid]="isValidCWL"
                         [data]="data"></tool-header>
        
            <div class="scroll-content">
                <div code-editor
                     class="editor flex-fill"
                     [content]="rawEditorContent"
                     [readonly]="!data.isWritable"
                     [language]="data.language | async"></div>
                     
                <ct-clt-editor *ngIf="viewMode === __modes.Gui"
                               class="gui-editor-component"
                               [readonly]="!data.isWritable"
                               [formGroup]="toolGroup"
                               [model]="toolModel"></ct-clt-editor>
            </div>
            <div class="status-bar-footer">
            
                <div class="left-side">
                    <validation-issues [issuesStream]="validation" 
                                       (select)="selectBottomPanel($event)" 
                                       [show]="bottomPanel === 'validation'"></validation-issues>
                    
                    <commandline [commandLineParts]="commandLineParts" 
                                 (select)="selectBottomPanel($event)" 
                                 [show]="bottomPanel === 'commandLine'"></commandline>
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
export class ToolEditorComponent extends ComponentBase implements OnInit, OnDestroy {
    @Input()
    public data: DataEntrySource;

    /** Stream of ValidationResponse for current document */
    public validation = new ReplaySubject<ValidationResponse>(1);

    /** Default view mode. */
    private viewMode = ViewMode.Code;

    /** Flag to indicate the document is loading */
    private isLoading = false;

    /** Flag for showing reformat prompt on GUI switch */
    private showReformatPrompt = true;

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    //@todo(maya) consider using ct-panel-switcher instead
    private bottomPanel: "validation"|"commandLine"|null;

    /** Flag for validity of CWL document */
    private isValidCWL = false;

    /** Stream of contents in code editor */
    private rawEditorContent = new BehaviorSubject<string>("");

    /** Model that's recreated on document change */
    private toolModel = new CommandLineToolModel("document");

    /** Sorted array of resulting command line parts */
    private commandLineParts: CommandLinePart[];

    private __modes = ViewMode;

    private toolGroup: FormGroup;

    constructor(private webWorkerService: WebWorkerService,
                private userPrefService: UserPreferencesService,
                private formBuilder: FormBuilder,
                private modal: ModalService) {

        super();

        this.toolGroup = formBuilder.group({});

        this.showReformatPrompt = this.userPrefService.get("show_reformat_prompt", true, true);
    }

    // @todo(maya) fix block loader
    // setting this.isLoading to false inside a sub doesn't (always) trigger view update
    // possible zone problem
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
            .map(r => {
                if (!r.isValidCwl) return r;

                let json = Yaml.safeLoad(this.rawEditorContent.getValue(), {json: true});

                // should show prompt, but json is already reformatted
                if (this.showReformatPrompt && json["rbx:modified"]) {
                    this.showReformatPrompt = false;
                }

                this.toolModel        = new CommandLineToolModel("document", json);
                this.commandLineParts = this.toolModel.getCommandLineParts();

                this.toolModel.validate();

                return {
                    errors: this.toolModel.validation.errors,
                    warnings: this.toolModel.validation.warnings,
                    isValidatableCwl: true,
                    isValidCwl: true,
                    isValidJSON: true
                };

            }).subscribe(this.validation);

        this.tracked = this.validation.subscribe(err => {
            this.isValidCWL = err.isValidCwl;
        });
    }

    private save(revisionNote: string) {
        const text = this.toolGroup.dirty ? this.getModelText() : this.rawEditorContent.getValue();

        if (this.data.data.source === "local") {
            this.data.data.save(text).subscribe(noop);
        } else {
            this.data.save(JSON.parse(text), revisionNote).subscribe(noop);
        }
    }

    /**
     * Toggles between GUI and Code view. If necessary, it will show a prompt about reformatting
     * when switching to GUI view.
     *
     * @param view
     */
    private switchView(view: ViewMode) {

        if (view === ViewMode.Gui) {

            if (this.showReformatPrompt) {
                this.modal.checkboxPrompt({
                    title: "Confirm GUI Formatting",
                    content: "Activating GUI mode might change the formatting of this document. Do you wish to continue?",
                    cancellationLabel: "Cancel",
                    confirmationLabel: "OK",
                    checkboxLabel: "Don't show this dialog again",
                }).then(res => {
                    if (res) this.userPrefService.put("show_reformat_prompt", false);

                    this.showReformatPrompt = false;
                    this.viewMode           = view;
                }, noop);

            } else {
                this.viewMode = view;
            }
        } else if (view === ViewMode.Code) {
            if (this.toolGroup.dirty) {
                this.rawEditorContent.next(this.getModelText());
            }

            this.viewMode = view;
        }
    }

    /**
     * Serializes model to text. It also adds rbx:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(): string {
        const modelObject = Object.assign(this.toolModel.serialize(), {"rbx:modified": true});

        return this.data.language.value === "json" ? JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    /**
     * Toggles the status bar panels
     * @param panel
     */
    private selectBottomPanel(panel: "validation"|"commandLineTool") {
        this.bottomPanel = this.bottomPanel === panel ? null : panel;
    }
}
