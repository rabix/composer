import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {CltEditorComponent} from "../clt-editor/clt-editor.component";
import {DynamicState} from "../runtime-compiler";
import {Subscription, Observable, ReplaySubject} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
import {ViewModeService} from "./services/view-mode.service";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {CommandLineComponent} from "../clt-editor/commandline/commandline.component";
import {ViewSwitcherComponent} from "../view-switcher/view-switcher.component";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";
import {ValidationIssuesComponent} from "../validation-issues/validation-issues.component";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {ExpressionSidebarService} from "../../services/sidebars/expression-sidebar.service";
import {InputSidebarService} from "../../services/sidebars/input-sidebar.service";
import {ToolSidebarService} from "../../services/sidebars/tool-sidebar.service";

require("./tool-container.component.scss");

@Component({
    selector: "tool-container",
    providers: [
        ViewModeService,
        ExpressionSidebarService,
        InputSidebarService,
        ToolSidebarService
    ],
    directives: [
        CodeEditorComponent,
        CltEditorComponent,
        BlockLoaderComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        ToolHeaderComponent,
        CommandLineComponent,
        SidebarComponent,
        ViewSwitcherComponent,
        ValidationIssuesComponent
    ],
    template: `
        <block-loader *ngIf="!isLoaded"></block-loader>
        
        <div class="tool-container-component" *ngIf="isLoaded">
            <tool-header class="tool-header"></tool-header>
        
            <div class="scroll-content">
                <code-editor *ngIf="(viewMode | async) === 'json'" [fileStream]="fileStream"></code-editor>
                <clt-editor class="gui-editor-component" [model]="model" *ngIf="(viewMode | async) === 'gui'" [fileStream]="fileStream"></clt-editor>
                
                <sidebar-component></sidebar-component>
            </div>
            
            <div class="status-bar-footer">
                <div class="left-side">
                    <validation-issues [issuesStream]="schemaValidationStream"></validation-issues>
                    <commandline [commandLineParts]="commandLineParts"></commandline>
                </div>
                <div class="right-side">
                    <view-switcher [viewMode]="viewMode" [disabled]="!isValid"></view-switcher>
                </div>
            </div>
        </div>
    `
})
export class ToolContainerComponent implements OnInit, DynamicState, OnDestroy {
    @Input()
    public fileStream: Observable<FileModel>;

    @Input()
    public schemaValidationStream: ReplaySubject<ValidationResponse>;

    /** Default view mode. */
    private viewMode: ReplaySubject<'gui' | 'json'>;

    /** File that we will pass to both the gui and JSON editor */
    private file: FileModel;

    /** Model that generates command line and does validation */
    private model: CommandLineToolModel;

    private commandLineParts: CommandLinePart[];

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[];

    /** Flag that determines if the spinner should be shown */
    private isLoaded: boolean;

    /** Flag for validity of CWL document */
    private isValid: boolean;

    constructor() {
        this.subs     = [];
        this.isLoaded = false;

        this.viewMode = new ReplaySubject<'json' | 'gui'>();
        this.viewMode.next('json');
    }

    ngOnInit(): void {
        // bring our own file up to date
        this.subs.push(this.fileStream.subscribe(file => {
            this.file = file;

            // while the file is being edited, attempt to recreate the model
            try {
                this.model              = new CommandLineToolModel(JSON.parse(this.file.content));
                this.commandLineParts = this.model.getCommandLineParts();

                // if the file isn't valid JSON, do nothing
            } catch (ex) {
            }

            this.isLoaded = true;
        }));

        // enable GUI switch when file is valid CWL
        this.subs.push(this.schemaValidationStream.subscribe((err: ValidationResponse) => {
            this.isValid = err.isValidCwl;
        }));
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
