import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {ComponentBase} from "../../../components/common/component-base";

@Component({
    selector: "ct-file-def-list",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">
                Files
            </span>
            
            <div class="tc-body">
                <ct-blank-tool-state *ngIf="!readonly && !entries.length"
                                     [title]="'Create temporary files needed for the tools'"
                                     [buttonText]="'Create a file'"
                                     (buttonClick)="addEntry()">
                </ct-blank-tool-state>
                
                <div *ngIf="entries.length" class="container">
                    <div class="gui-section-list-title row">
                        <div class="col-sm-5">Name</div>
                        <div class="col-sm-7">Content</div>
                    </div>
                
                    <ul class="gui-section-list row">
                    
                         
                        
                        <li *ngFor="let entry of entries; let i = index"
                            class="gui-section-list-item clickable validatable">
                            
                            <div class="col-sm-5 ellipsis">
                                {{ entry?.filename | fileDefName }}
                            </div>
                            
                            <div class="ellipsis" [ngClass]="{
                                'col-sm-6': !readonly,
                                'col-sm-7': readonly
                            }" [title]="entry?.fileContent | fileDefContent">
                                {{ entry?.fileContent | fileDefContent }}
                            </div>
                            
                            <div *ngIf="!readonly" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(i)"></i>
                            </div>
                        </li>
                    </ul>
                
                </div>
            
                <button *ngIf="!readonly && entries.length" 
                        (click)="addEntry()" 
                        type="button" 
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add a File
                </button>
            </div>
        </ct-form-panel>
    `
})
export class FileDefListComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: {
        filename?: string,
        fileContent?: string,
    }[] = [];

    @Input()
    public readonly = false;

    private hovers = [];

    constructor() {
        super();
    }

    ngOnInit() {
        console.log("Got entries", this.entries);
    }

    private addEntry() {
        this.entries = this.entries.concat({});
    }

    private removeEntry(index) {
        this.entries = this.entries.slice(0, index).concat(this.entries.slice(index + 1));
    }
}