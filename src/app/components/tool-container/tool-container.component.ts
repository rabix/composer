import {Component, OnInit} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {GuiEditorComponent} from "../gui-editor/gui-editor.component";
import {DynamicState} from "../runtime-compiler/dynamic-state.interface";
import {FileRegistry} from "../../services/file-registry.service";
import {Subscription} from "rxjs/Rx";
import {ToolHeader} from "./tool-header/tool-header.component";

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
        ToolHeader
    ],
    template: `
        <div id="viewContainer">
            <tool-header id="toolHeader" 
            [viewMode]="viewMode"
            (viewModeChanged)="setViewMode($event)"></tool-header>
        
            <main>
                <div [ngSwitch]="viewMode">
                    <block-loader *ngIf="!file"></block-loader>
                    <gui-editor *ngSwitchCase="'gui'" [file]="file"></gui-editor>
                    <code-editor *ngSwitchCase="'json'" [file]="file"></code-editor>
                </div>
            </main>
        </div>
    `
})
export class ToolContainerComponent implements OnInit, DynamicState {
    /** Default view mode. TODO: change type */
    viewMode: ViewMode = "gui";
    
    /** File that we will pass to bothe the gui and JSON edtior*/
    file: FileModel;

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
            this.file     = file;
        }));
    }

    setViewMode(viewMode): void {
        this.viewMode = viewMode;
    }

    public setState(state: {fileInfo}): void {
        this.file = state.fileInfo;
    }
}
