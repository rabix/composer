import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {CltEditorComponent} from "../clt-editor/clt-editor.component";
import {Subscription, Observable, ReplaySubject, BehaviorSubject} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
import {ViewModeService} from "./services/view-mode.service";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {SidebarComponent} from "../sidebar/sidebar.component";
import {CommandLineComponent} from "../clt-editor/commandline/commandline.component";
import {ViewModeSwitchComponent} from "../view-switcher/view-switcher.component";
import {ValidationResponse} from "../../services/webWorker/json-schema/json-schema.service";
import {DataEntrySource} from "../../sources/common/interfaces";
import {WebWorkerService} from "../../services/webWorker/web-worker.service";
import {ViewSwitcherComponent} from "../view-switcher/view-switcher.component";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {ValidationIssuesComponent} from "../validation-issues/validation-issues.component";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";

require("./tool-container.component.scss");


@Component({
    selector: "ct-tool-editor",
    providers: [ViewModeService],
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
        ViewModeSwitchComponent,
        ValidationIssuesComponent
    ],
    template: `
        <div class="tool-container-component">
            <tool-header class="tool-header"></tool-header>
        
            <div class="scroll-content">
                <ct-code-editor *ngIf="viewMode === 'code'"
                                [content]="textContent"
                                [language]="data.language">
                </ct-code-editor>
        
                <ct-clt-editor *ngIf="viewMode === 'gui'"
                               class="gui-editor-component"
                               [model]="toolModel"
                               [fileStream]="tabData">
                </ct-clt-editor>
        
                <sidebar-component></sidebar-component>
            </div>
            <div class="status-bar-footer">
                <div class="left-side">
                    <validation-issues [issuesStream]="schemaValidationStream"></validation-issues>
                    <commandline [commandLineParts]="commandLineParts"></commandline>
                </div>
                <div class="right-side">
                    <ct-view-mode-switch [viewMode]="viewMode"
                                     [disabled]="!isValid"
                                     (onSwitch)="viewMode = $event">
                    </ct-view-mode-switch>
                </div>
            </div>
        </div>
    `
})
export class ToolEditorComponent implements OnInit, OnDestroy {
    @Input()
    public data: DataEntrySource;

    public schemaValidation: ReplaySubject<ValidationResponse>;

    private textContent = new BehaviorSubject("");

    /** Default view mode. */
    private viewMode: "code"|"gui" = "code";

    private toolModel: CommandLineToolModel;

    private commandLineParts: CommandLinePart[];

    /** Flag for validity of CWL document */
    private isValid = true;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[] = [];

    constructor(private webWorkerService: WebWorkerService) {

    }

    ngOnInit(): void {

        this.data.content.subscribe(this.textContent);

        this.textContent.subscribe(rawText => {
            try {
                this.toolModel = new CommandLineToolModel(JSON.parse(rawText));
                this.commandLineParts = this.toolModel.getCommandLineParts();

                // if the file isn't valid JSON, do nothing
            } catch (ex) {
            }
        });

        // this.webWorkerService.validationResultStream
        //     .do(data => console.debug("Validation", data))
        //     .subscribe(this.schemaValidation);
        // // bring our own file up to date
        // this.subs.push(this.tabData.subscribe(file => {
        //     this.file = file;
        //
        //     // while the file is being edited, attempt to recreate the model
        //     try {
        //         this.model              = new CommandLineToolModel(JSON.parse(this.file.content));
        //         this.commandlineContent = this.model.getCommandLine();
        //
        //         // if the file isn't valid JSON, do nothing
        //     } catch (ex) {
        //     }
        //
        // }));
        //
        // // enable GUI switch when file is valid CWL
        // this.subs.push(this.schemaValidation.subscribe((err: ValidationResponse) => {
        //     this.isValid = err.isValidCwl;
        // }));
    }

    ngOnDestroy(): void {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}
