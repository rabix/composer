import {Component, Input, OnInit} from '@angular/core';
import {ActionButtonComponent} from "./action-button.component";
import {ModalComponent, ModalType} from "../../modal/modal.component";

@Component({
    selector: 'new-file-button',
    template: `
        <action-button class="nav-link" 
                        title="New File" 
                        buttonType="{{ buttonType }}" 
                        iconClass="fa fa-file fa-lg"
                        (click)="openModal()">
        </action-button>
    `,
    providers: [ModalComponent],
    directives: [ActionButtonComponent]
})
export class NewFileButtonComponent implements OnInit {
    @Input() buttonType: string;
    fileTypes: any[];
    selectedType: any;

    constructor(private modal: ModalComponent) {
        this.fileTypes = [{
            id: '.json',
            name: 'JSON'
        }, {
            id: '.yaml',
            name: 'YAML'
        }, {
            id: '.js',
            name: 'JavaScript'
        }];

        this.selectedType = this.fileTypes[0];
    }

    /**
     * Opens new file modal
     */
    openModal(): void {
        this.modal.show().then((result) => {
            console.log(result);
        });
    }

    ngOnInit() {
        this.initModal();
    }

    initModal() {
        this.modal.dynamicTemplateString = `
        <h4>Create New File</h4>
        
        <form>
            <fieldset class="form-group">
                <label for="fileName">Enter file name</label>
                <input type="text" class="form-control" id="fileName" [(ngModel)]="data.fileName" required placeholder="File Name">
            </fieldset>
      
            <fieldset class="form-group">
                <label for="create_file_action">File Type</label>
                <select class="form-control" id="create_file_action" [(ngModel)]="data.selectedType">
                    <option *ngFor="let fileType of data.fileTypes" [ngValue]="type">{{ fileType.name }} ({{ fileType.id }})</option>
                </select>
            </fieldset>
        </form>
        `;

        this.modal.data = {
            fileTypes: this.fileTypes,
            selectedValue: this.selectedType,
        };

        this.modal.blocking   = false;
        this.modal.type       = ModalType.Default;
        this.modal.cancelBtn  = 'Cancel';
        this.modal.confirmBtn = 'Create';
        this.modal.width      = 350;
        this.modal.height     = 300;
    }
}