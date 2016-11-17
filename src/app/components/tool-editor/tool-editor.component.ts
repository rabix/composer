import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {CltEditorComponent} from "../clt-editor/clt-editor.component";
import {ReplaySubject, BehaviorSubject, Observable} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
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
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ModalService} from "../modal";
import {ComponentBase} from "../common/component-base";
import {noop} from "../../lib/utils.lib";

const YAML = require("js-yaml");
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
                     
                <ct-clt-editor *ngIf="viewMode === 'gui'"
                               class="gui-editor-component"
                               [readonly]="!data.isWritable"
                               (dirty)="modelChanged = $event"
                               [model]="toolModel"></ct-clt-editor>
            </div>
            <div class="status-bar-footer">
                <div class="left-side">
                    <validation-issues [issuesStream]="schemaValidation" 
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
    public schemaValidation = new ReplaySubject<ValidationResponse>(1);

    /** Default view mode. */
    private viewMode: "code"|"gui" = "code";

    /** Flag to indicate the document is loading */
    private isLoading = false;

    /** Flag for showing reformat prompt on GUI switch */
    private showReformatPrompt: boolean;

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
        //@todo(maya) consider using ct-panel-switcher instead
    private bottomPanel: "validation"|"commandLine"|null;

    /** Flag for validity of CWL document */
    private isValidCWL = false;

    /** Stream of contents in code editor */
    private rawEditorContent = new BehaviorSubject("");

    /** Model that's recreated on document change */
    private toolModel = new CommandLineToolModel();

    /** Flag for dirty status of CLT editor forms */
    private modelChanged: boolean = false;

    /** Sorted array of resulting command line parts */
    private commandLineParts: CommandLinePart[];

    constructor(private webWorkerService: WebWorkerService,
                private userPrefService: UserPreferencesService,
                private modal: ModalService) {

        super();

        this.tracked = this.userPrefService.get("show_reformat_prompt").subscribe(x => this.showReformatPrompt = x);

        // set default if userPref does not exist
        if (this.showReformatPrompt === undefined) {
            this.userPrefService.put("show_reformat_prompt", true);
            this.showReformatPrompt = true;
        }
    }

    // @todo(maya) fix block loader
    // setting this.isLoading to false inside a sub doesn't (always) trigger view update
    // possible zone problem
    ngOnInit(): void {
        this.tracked = (this.rawEditorContent as Observable)
            .skip(1)
            .distinctUntilChanged()
            .subscribe(latestContent => {
                this.validateSchema(latestContent);
            });

        this.tracked = this.data.content.subscribe(val => {
            this.rawEditorContent.next(val);
        });


        this.tracked = this.webWorkerService.validationResultStream.subscribe(this.schemaValidation);

        this.tracked = this.webWorkerService.validationResultStream.subscribe(err => {
            this.isValidCWL = err.isValidCwl;
        });
    }

    private validateSchema(content: string) {
        this.webWorkerService.validateJsonSchema(content);

        try {
            let json = YAML.safeLoad(content, {json: true});

            // should show prompt, but json is already reformatted
            if (this.showReformatPrompt && json["rbx:modified"]) {
                this.showReformatPrompt = false;
            }

            this.toolModel = new CommandLineToolModel(json);
            this.toolModel.validate();
            this.commandLineParts = this.toolModel.getCommandLineParts();
        } catch (ex) {
            // if the file isn't valid JSON, do nothing
        }
    }

    private save(revisionNote: string) {
        const text = this.modelChanged ? this.getModelText() : this.rawEditorContent.getValue();

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
    private switchView(view: "gui" | "code") {
        if (view === "gui") {
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
                    this.viewMode = view;
                }, noop);

            } else {
                this.viewMode = view;
            }
        }

        if (view === "code") {
            if (this.modelChanged) this.rawEditorContent.next(this.getModelText());

            this.viewMode = view;
        }
    }

    /**
     * Serializes model to text. It also adds rbx:modified flag to indicate
     * the text has been formatted by the GUI editor
     *
     * @returns {string}
     */
    private getModelText(): string {
        let json = this.toolModel.serialize();
        json["rbx:modified"] = true;

        return this.data.language.value === "json" ? JSON.stringify(json, null, 4) : YAML.dump(json);
    }

    /**
     * Toggles the status bar panels
     * @param panel
     */
    private selectBottomPanel(panel: "validation"|"commandLineTool") {
        this.bottomPanel = this.bottomPanel === panel ? null : panel;
    }
}
