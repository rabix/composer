import {Component, Input} from "@angular/core";
import {OutputPortsService} from "./output-ports.service";
import {ListEntryComponent} from "../controls/list-entry.component";
import {ComponentBase} from "../../common/component-base";

@Component({
    selector: "ct-output-ports",
    providers: [OutputPortsService],
    directives: [ListEntryComponent],
    template: `
        <ct-form-section>
            <div class="tc-header">Output Ports</div>
            <div class="tc-body">
                
                <div *ngIf="entries.length === 0">
                    No output ports have been set yet.
                </div>
     
                <div *ngIf="entries.length" class="gui-section-list-title">
                    <div class="col-sm-4">Glob</div>
                    <div class="col-sm-3">ID</div>
                    <div class="col-sm-5">Type</div>
                </div>
            
                <ul class="gui-section-list">
                    <li *ngFor="let entry of entries; let i = index"
                        class="gui-section-list-item clickable">
            
                        <div class="col-sm-4 ellipsis" [title]="entry?.glob">{{ entry?.glob }}</div>
            
                        <div class="col-sm-3 ellipsis" [title]="entry?.id">{{ entry?.id }}</div>
                        
                        <div class="col-sm-3 ellipsis" [title]="entry?.type">{{ entry?.type}}</div>
            
                        <div class="col-sm-2 align-right">
                            <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(index)"></i>
                        </div>
                    </li>
                </ul>
                
                <button (click)="addEntry()" type="button" class="btn btn-link pull-right no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> Add Input
                </button>
            </div>
        
        </ct-form-section>
    `
})
export class OutputPortsComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    private entries = [];

    private addEntry() {
        const data = {id: Math.random()};
        this.entries.push(data);
    }

    private removeEntry(index) {
        this.entries.slice(index, 1);
    }
}