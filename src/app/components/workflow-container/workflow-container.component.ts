import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {FileModel} from "../../store/models/fs.models";
import {Observable, Subscription} from "rxjs";
import {CodeEditorComponent} from "../code-editor/code-editor.component";

@Component({
    selector: 'ct-workflow-editor',
    directives: [CodeEditorComponent],
    template: `
    <block-loader *ngIf="!isLoaded"></block-loader>
        
        <div class="tool-container-component" *ngIf="isLoaded">
            <tool-header class="tool-header"></tool-header>
        
            <div class="scroll-content">
                <ct-code-editor *ngIf="viewMode === 'json'" [fileStream]="fileStream"></ct-code-editor>
                <div class="gui-editor-component" *ngIf="viewMode === 'gui'"> 
                    Workflow Editor Coming Soon
                </div>
                
            </div>
            
        </div>
    <div>Workflow Editor Coming Soon</div>
`
})
export class WorkflowContainerComponent implements OnInit, OnDestroy {
    @Input()
    public fileStream: Observable<FileModel>;

    private subs: Subscription[] = [];
    private file: FileModel;

    private isLoaded = false;

    ngOnInit() {
        this.subs.push(this.fileStream.subscribe(file => {
            this.file     = file;
            this.isLoaded = true;
        }));

    }

    ngOnDestroy() {
        this.subs.forEach(sub => sub.unsubscribe());
    }
}