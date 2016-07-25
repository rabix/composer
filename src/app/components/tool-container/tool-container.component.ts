import {Component, OnInit} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault, NgSelectOption} from "@angular/common";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {GuiEditorComponent} from "../gui-editor/gui-editor.component";

require('./tool-container.component.scss');

@Component({
    selector: 'editor-wrapper',
    directives: [
        CodeEditorComponent,
        GuiEditorComponent,
        BlockLoaderComponent,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        NgSelectOption
    ],
    template: `
                <div id="viewContainer">
                    <div id="buttonsContainer">
                        <select id="revisionSelect" name="rev" [ngModel]="selectedRevision" (change)="onChange($event)">
                            <option *ngFor="let revision of revisions" [value]="revision">{{revision}}</option>
                        </select>
                    
                        <span id="guiJsonButtons">
                            <button type="button" 
                                    class="btn btn-secondary selected" 
                                    [ngClass]="{selected: viewMode === 'json'}"
                                    (click)="setViewMode('json')">JSON</button>
                                    
                            <button type="button"
                                    class="btn btn-secondary" 
                                    [ngClass]="{selected: viewMode === 'gui'}"
                                    (click)="setViewMode('gui')">GUI</button>
                        </span>
                        
                        <button id="saveButton" type="button" class="btn btn-secondary">Save</button>
                    </div>
                   
                    <div [ngSwitch]="viewMode">
                        <block-loader *ngIf="!file"></block-loader>
                        
                        <gui-editor *ngSwitchDefault [file]="file"></gui-editor>
                        <gui-editor *ngSwitchCase="'gui'" [file]="file"></gui-editor>
                        <code-editor *ngSwitchCase="'json'" [file]="file"></code-editor>
                    </div>
                </div>`,
})
export class ToolContainerComponent implements OnInit {
    viewMode: string = 'gui';
    file: FileModel;

    /* TODO: load actual revisions */
    revisions: Array<string> = ['rev1', 'rev2', 'rev3'];
    selectedRevision: string = this.revisions[0];

    constructor() {}

    ngOnInit(): void {

    }

    onChange(e): void {
        this.selectedRevision = e.target.value;
    }

    setViewMode(viewMode): void {
        this.viewMode = viewMode;
    }

    public setState(state): void {
        if (state.fileInfo) {
            this.file = state.fileInfo;
        }
    }
}
