import {Component, Input} from "@angular/core";
import {OutputPortsService} from "./output-ports.service";
import {ComponentBase} from "../../common/component-base";
import {CommandOutputParameter} from "cwlts";
import {CommandOutputTypePipe} from "../../../cwl/pipes/command-output-type.pipe";
import {CommandOutputGlobPipe} from "../../../cwl/pipes/command-output-glob.pipe";

@Component({
    selector: "ct-output-ports",
    providers: [OutputPortsService],
    directives: [CommandOutputTypePipe, CommandOutputGlobPipe],
    template: `
        <ct-form-section>
            <div class="tc-header">Output Ports</div>
            <div class="tc-body">
                
                <div *ngIf="entries.length === 0">
                    No output ports have been set yet.
                </div>
     
                <div *ngIf="entries.length" class="gui-section-list-title">
                    <div class="col-sm-4">ID</div>
                    <div class="col-sm-3">Type</div>
                    <div class="col-sm-5">Glob</div>
                </div>
            
                <ul class="gui-section-list">
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
        
        </ct-form-section>
    `
})
export class OutputPortsComponent extends ComponentBase {

    /** List of entries that should be shown */
    @Input()
    public entries: CommandOutputParameter[] = [];

    @Input()
    public readonly = false;

    private addEntry() {
        this.entries.push({} as any);
    }

    private removeEntry(index) {
        this.entries.splice(index, 1);
    }
}