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

require("./tool-container.component.scss");

export type ViewMode = "gui" | "json";

@Component({
    selector: "tool-container",
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
                        [file]="file"
                        [viewMode]="viewMode"
                        (viewModeChanged)="setViewMode($event)">
            </tool-header>
        
            <div class="scroll-content">
                <div class="main-content">
                    <code-editor *ngIf="viewMode === 'json'" [file]="file"></code-editor>
                    <clt-editor class="gui-editor-component" *ngIf="viewMode === 'gui'" [file]="file"></clt-editor>
                    
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
    /** Default view mode. TODO: change type */
    private viewMode: ViewMode = "gui";

    /** File that we will pass to both the gui and JSON editor*/
    private file: FileModel;

    /* TODO: generate the commandline */
    private commandlineContent: string = "This is the command line";

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[];

    /** Flag that determines if the spinner should be shown */
    private isLoaded: boolean;
    
    constructor(private fileRegistry: FileRegistry) {
        this.subs = [];
        this.isLoaded = false;
    }

    ngOnInit(): void {
        // This file that we need to show, check it out from the file repository
        const fileStream = this.fileRegistry.getFile(this.file);

        // bring our own file up to date
        this.subs.push(fileStream.subscribe(file => {
            this.file = file;
            this.isLoaded = true;
        }));
    }

    private setViewMode(viewMode): void {
        this.viewMode = viewMode;
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
