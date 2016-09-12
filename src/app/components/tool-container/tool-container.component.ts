import {Component, OnInit} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {CltEditorComponent} from "../clt-editor/clt-editor.component";
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {FileRegistry} from "../../services/file-registry.service";
import {Subscription} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
import {CommandLineComponent} from "../clt-editor/commandline/commandline.component";
import {InputInspectorSidebarComponent} from "../sidebar/object-inpsector/input-inspector-sidebar.component";
import {ExpressionEditorSidebarComponent} from "../sidebar/expression-editor/expression-editor-sidebar.component";
import {ViewModeService} from "./services/view-mode.service";
import {CommandLineToolModel} from "cwlts/lib/models/d2sb";

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
        CommandLineComponent,
        InputInspectorSidebarComponent,
        ExpressionEditorSidebarComponent
    ],
    template: `
        <block-loader *ngIf="!isLoaded"></block-loader>
        
        <div class="tool-container-component" *ngIf="isLoaded">
            <tool-header class="tool-header" 
                        [file]="file">
            </tool-header>
        
            <div class="scroll-content">
                <div class="main-content">
                    <code-editor *ngIf="viewMode === 'json'" [file]="file"></code-editor>
                    <clt-editor class="gui-editor-component" [model]="model" *ngIf="viewMode === 'gui'" [file]="file"></clt-editor>
                    
                    <input-inspector-sidebar-component></input-inspector-sidebar-component>
                    <expression-editor-sidebar-component></expression-editor-sidebar-component>
                </div>
            </div>
            
            <div class="footer">
                <commandline [content]="commandlineContent"></commandline>
            </div>
        </div>
    `
})
export class ToolContainerComponent implements OnInit, DynamicState {
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

    constructor(private fileRegistry: FileRegistry,
                private viewModeService: ViewModeService) {
        this.subs     = [];
        this.isLoaded = false;

        this.viewModeService.setViewMode("json");
        this.viewModeService.viewMode.subscribe(viewMode => {
            this.viewMode = viewMode;
        });
    }

    ngOnInit(): void {
        // This file that we need to show, check it out from the file repository
        const fileStream = this.fileRegistry.getFile(this.file);

        // bring our own file up to date
        this.subs.push(fileStream.subscribe(file => {
            this.file     = file;
            this.model    = new CommandLineToolModel(JSON.parse(this.file.content));
            this.commandlineContent = this.model.getCommandLine();
            this.isLoaded = true;
        }));
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
