import {Component, Input, Output} from "@angular/core";
import {DataEntrySource} from "../../../sources/common/interfaces";
import {Subject} from "rxjs";

@Component({
    selector: "tool-header",
    template: `
        <div *ngIf="!actionPending">
            <button *ngIf="data.isWritable"
                    [disabled]="!fileIsValid && data.data.source !== 'local'" 
                    [ct-tooltip]="'Save'"
                    (click)="saveAction()" 
                    type="button" 
                    class="btn btn-secondary btn-sm save-button">
                    <i class="fa fa-save" ></i>
            </button>
            
            <button *ngIf="data.isWritable"
                    [ct-tooltip]="'Copy...'"
                    type="button" 
                    class="btn btn-secondary btn-sm">
                    <i class="fa fa-files-o"></i>
            </button>
                    
            <span *ngIf="!data.isWritable"> 
                <span class="tag tag-default"><i class="fa fa-lock"></i> LOCKED</span>
            </span>
        </div>
        <div *ngIf="actionPending === 'revision_note'">
        
            <form (ngSubmit)="onSubmit(revisionNote.value)" #revision="ngForm">
                <div class="row">
                    <div class="col-sm-8">
                        <input #revisionNote
                                (keyup)="$event.keyCode === 27 && (actionPending = null)"
                                autofocus 
                                class="form-control" 
                                placeholder="Revision Note">
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm"><i class="fa fa-check"></i></button>
                    <button (click)="actionPending = null" type="button" class="btn btn-secondary btn-sm"><i class="fa fa-times"></i></button>
                </div>
            </form>
        </div>
        
    `
})
export class ToolHeaderComponent {

    @Input()
    public data: DataEntrySource;

    private actionPending = null;

    @Output()
    public save = new Subject<any>();

    @Input()
    public fileIsValid = true;


    public onSubmit(data) {
        this.actionPending = null;
        this.save.next(data);
    }

    private saveAction() {

        if (this.data.data.source !== "local") {
            this.actionPending = 'revision_note';
            return;
        }

        this.save.next("");
    }
}
