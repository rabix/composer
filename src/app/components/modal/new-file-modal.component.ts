import {Component, OnInit} from "@angular/core";
import {NgStyle} from "@angular/common";

@Component({
    directives: [ NgStyle ],
    template: `
        <h4>Create New File</h4>
        
        <loading-spinner></loading-spinner>

        <form #newFileForm="ngForm">
            <fieldset class="form-group">
                <label for="fileName">Enter file name</label>
                <input ngControl="name" #name="ngForm" required
                 type="text" class="form-control" id="fileName" [(ngModel)]="data.fileName"
                 placeholder="File Name">
            </fieldset>

            <fieldset class="form-group">
                <label for="create_file_action">File Type</label>
                <select class="form-control" id="create_file_action" [(ngModel)]="data.selectedType">
                    <option *ngFor="let fileType of data.fileTypes" [ngValue]="fileType">{{ fileType.name }} ({{ fileType.id }})</option>
                </select>
            </fieldset>

          <div>
                <button class="btn btn-default" type="button" (click)="cancel()"> Cancel </button>
                <button class="btn btn-primary" type="button" (click)="confirm(data)" [disabled]="!newFileForm.form.valid"> Create </button>
          </div>

        </form>
        `
})
export class NewFileModalComponent implements OnInit {
    constructor() { }

    public ngOnInit() { }
}
