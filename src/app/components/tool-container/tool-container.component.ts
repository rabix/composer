import {Component, OnInit, Input} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {CltEditorComponent} from "../clt-editor/clt-editor.component";
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {Subscription, Observable} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
import {InputInspectorSidebarComponent} from "../sidebar/object-inpsector/input-inspector-sidebar.component";
import {ExpressionEditorSidebarComponent} from "../sidebar/expression-editor/expression-editor-sidebar.component";
import {ViewModeService} from "./services/view-mode.service";
import {CommandLineToolModel} from "cwlts/lib/models/d2sb";
import {ToolFooterComponent} from "./tool-footer/tool-footer.component";

require("./tool-container.component.scss");

@Component({
    selector: "tool-container",
    providers: [ViewModeService],
    directives: [
        CodeEditorComponent,
        CltEditorComponent,
        BlockLoaderComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        ToolHeaderComponent,
        ToolFooterComponent,
        InputInspectorSidebarComponent,
        ExpressionEditorSidebarComponent
    ],
    template: `
        <block-loader *ngIf="!isLoaded"></block-loader>
        
        <div class="tool-container-component" *ngIf="isLoaded">
            <tool-header class="tool-header"></tool-header>
        
            <div class="scroll-content">
                <code-editor *ngIf="viewMode === 'json'" [fileStream]="fileStream"></code-editor>
                <clt-editor class="gui-editor-component" [model]="model" *ngIf="viewMode === 'gui'" [fileStream]="fileStream"></clt-editor>
                
                <input-inspector-sidebar-component class="tool-sidebar"></input-inspector-sidebar-component>
                <expression-editor-sidebar-component class="tool-sidebar"></expression-editor-sidebar-component>

            </div>
            
            <tool-footer class="tool-footer" [commandLine]="commandlineContent"></tool-footer>
        </div>
    `
})
export class ToolContainerComponent implements OnInit, DynamicState {
    @Input()
    public fileStream: Observable<FileModel>;

    /** Default view mode. */
    private viewMode: string;

    /** File that we will pass to both the gui and JSON editor*/
    private file: FileModel;

    private model: CommandLineToolModel;

    private commandlineContent: string = '';

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[];

    /** Flag that determines if the spinner should be shown */
    private isLoaded: boolean;

    constructor(private viewModeService: ViewModeService) {
        this.subs     = [];
        this.isLoaded = false;

        this.viewModeService.setViewMode("json");
        this.viewModeService.viewMode.subscribe(viewMode => {
            this.viewMode = viewMode;
        });
    }

    ngOnInit(): void {
        // This file that we need to show, check it out from the file repository
        // const fileStream = this.fileRegistry.getFile(this.file);

        // bring our own file up to date
        this.subs.push(this.fileStream.subscribe(file => {
            this.file  = file;
            this.model = new CommandLineToolModel(JSON.parse(this.file.content));
            this.commandlineContent = this.model.getCommandLine();
            this.isLoaded           = true;
        }));
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
