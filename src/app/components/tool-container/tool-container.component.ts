import {Component, OnInit} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {GuiEditorComponent} from "../gui-editor/gui-editor.component";
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {FileRegistry} from "../../services/file-registry.service";
import {Subscription} from "rxjs/Rx";
import {ToolHeaderComponent} from "./tool-header/tool-header.component";
import {CommandLineComponent} from "../gui-editor/commandline/commandline.component";

require("./tool-container.component.scss");

export type ViewMode = "gui" | "json";

@Component({
    selector: "tool-container",
    directives: [
        CodeEditorComponent,
        GuiEditorComponent,
        BlockLoaderComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        ToolHeaderComponent,
        CommandLineComponent
    ],
    template: `
        <div class="tool-container-component">
            <tool-header class="tool-header" [viewMode]="viewMode" (viewModeChanged)="setViewMode($event)"></tool-header>
        
            <div class="main-content">
                <code-editor *ngIf="viewMode === 'json'" [file]="file"></code-editor>
                <gui-editor *ngIf="viewMode === 'gui'" [file]="file"></gui-editor>
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

    constructor(private fileRegistry: FileRegistry) {
        this.subs = [];
    }

    ngOnInit(): void {
        // This file that we need to show, check it out from the file repository
        const fileStream = this.fileRegistry.getFile(this.file);

        // bring our own file up to date
        this.subs.push(fileStream.subscribe(file => {
            this.file = file;
        }));
    }

    setViewMode(viewMode): void {
        this.viewMode = viewMode;
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
