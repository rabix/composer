import {Component, Input} from "@angular/core";
import {ComponentBase} from "../../common/component-base";

@Component({
    selector: "ct-hint-list",
    template: `
        <ct-form-panel [collapsed]="false">
            <div class="tc-header">
                Hints
            </div>
            
            <div class="tc-body container">
               
                <div *ngIf="entries.length === 0">
                    No execution hints specified.
                </div>
     
                <div *ngIf="entries.length" class="gui-section-list-title row">
                    <div class="col-sm-5">Class</div>
                    <div class="col-sm-7">Value</div>
                </div>
            
                <ul class="gui-section-list row">
                    <li *ngFor="let entry of entries; let i = index"
                        class="gui-section-list-item clickable">
                        
                        <div class="col-sm-5 ellipsis">{{ entry?.class }}</div>
                        
                        <div class="ellipsis col-sm-6" [class.col-sm-7]="readonly">{{ entry?.value }}</div>
                        
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
export class HintListComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: {"class": string, value: string}[] = [];

    @Input()
    public readonly = false;

    private addEntry() {
        this.entries.push({} as any);
    }

    private removeEntry(index) {
        this.entries.splice(index, 1);
    }
}