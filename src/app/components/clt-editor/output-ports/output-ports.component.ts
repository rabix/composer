import {Component, Input} from "@angular/core";
import {ComponentBase} from "../../common/component-base";

@Component({
    selector: "ct-output-ports",
    template: `
        <ct-form-panel [collapsed]="false">
            <span class="tc-header">Output Ports</span>
            <div class="tc-body container">
                <div *ngIf="entries.length === 0">
                    No output ports have been set yet.
                </div>
     
                <div *ngIf="entries.length" class="gui-section-list-title row">
                    <div class="col-sm-4">ID</div>
                    <div class="col-sm-3">Type</div>
                    <div class="col-sm-5">Glob</div>
                </div>
            
                <ul class="gui-section-list row">
                    <li *ngFor="let entry of entries; let i = index"
                        class="gui-section-list-item clickable">
                        
                        <div class="col-sm-4 ellipsis" [title]="entry?.id">{{ entry?.id }}</div>
                        <div class="col-sm-3 ellipsis" [title]="entry?.type">{{ entry?.type | commandOutputType}}</div>
                        <div [ngClass]="{
                            'col-sm-4': !readonly,
                            'col-sm-5': readonly
                        }" class="ellipsis">{{ entry?.outputBinding?.glob | commandOutputGlob }}</div>
                        
                                
            
                        <div *ngIf="!readonly" class="col-sm-1 align-right">
                            <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(index)"></i>
                        </div>
                    </li>
                </ul>
                
                <button *ngIf="!readonly" 
                        (click)="addEntry()" 
                        type="button" 
                        class="btn btn-link pull-right no-outline no-underline-hover">
                        
                    <i class="fa fa-plus"></i> Add Output
                </button>    
            </div>
        </ct-form-panel>
    `
})
export class OutputPortsComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: {
        id: string,
        type: any,
        outputBinding: {
            glob: any
        }}[] = [];

    @Input()
    public readonly = false;

    private addEntry() {
        this.entries.push({} as any);
    }

    private removeEntry(index) {
        this.entries.splice(index, 1);
    }
}