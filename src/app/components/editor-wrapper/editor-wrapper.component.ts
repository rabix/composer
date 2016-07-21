import {Component, OnInit, ElementRef} from "@angular/core";
import {NgSwitch, NgSwitchCase, NgSwitchDefault, NgSelectOption} from "@angular/common";
import {FileRegistry} from "../../services/file-registry.service";
import {BlockLoaderComponent} from "../block-loader/block-loader.component";
import {FileModel} from "../../store/models/fs.models";
import {CodeEditorComponent} from "../code-editor/code-editor.component";
import {GuiEditorComponent} from "../gui-editor/gui-editor.component";

require('./editor-wrapper.component.scss');

@Component({
    selector: 'editor-wrapper',
    directives: [CodeEditorComponent, GuiEditorComponent, BlockLoaderComponent, NgSwitch, NgSwitchCase, NgSwitchDefault, NgSelectOption],
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
                        <gui-editor *ngSwitchCase="'gui'" *ngSwitchDefault [file]="file"></gui-editor>
                        <code-editor *ngSwitchCase="'json'" [file]="file"></code-editor>
                    </div>
                </div>`,
})
export class EditorWrapperComponent implements OnInit {
    viewMode: string = 'gui';
    file: FileModel;

    /* TODO: load actuala revisions */
    revisions: Array<string> = ['rev1', 'rev2', 'rev3'];
    selectedRevision: string = this.revisions[0];

    constructor(private elem: ElementRef, private fileRegistry: FileRegistry) {}

    ngOnInit(): any {

    }

    onChange(e) {
        this.selectedRevision = e.target.value;
    }

    setViewMode(viewMode) {
        this.viewMode = viewMode;
    }

    public setState(state) {
        // @todo figure out why this is undefined on startup
        if (state.fileInfo) {
            this.file = state.fileInfo;
        }
    }
}
