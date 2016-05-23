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
                        (click)="newFileDialog()">
        </action-button>
    `,
    providers: [ModalComponent],
    directives: [ActionButtonComponent]
})
export class NewFileButtonComponent implements OnInit {
    @Input() buttonType: string;
             actions: any[];
             selectedAction: any;

    constructor(private modal: ModalComponent) {
        this.actions = [{
            id: 'import',
            name: 'Import App from Description'
        }, {
            id: 'tool',
            name: 'Blank Command Line Tool'
        }, {
            id: 'workflow',
            name: 'Blank Workflow'
        }];

        this.selectedAction = this.actions[0];
    }

    newFileDialog(): void {
        this.modal.show();
    }

    ngOnInit() {
        this.initModal();
    }

    initModal() {
        this.modal.dynamicTemplateString = `
        <h4>Create New App</h4>
        
        <form>
            <fieldset class="form-group">
                <label for="fileName">Enter file name</label>
                <input type="text" class="form-control" id="fileName" [(ngModel)]="data.fileName" placeholder="File Name">
            </fieldset>
      
            <fieldset class="form-group">
                <label for="create_file_action">{{data.selectLabel}}</label>
                <select class="form-control" id="create_file_action" [(ngModel)]="data.selectedValue">
                    <option *ngFor="let value of data.selectOptions" [ngValue]="value">{{value.name}}</option>
                </select>
            </fieldset>
        </form>
        `;

        this.modal.data = {
            selectLabel: 'Action Type',
            selectOptions: this.actions,
            selectedValue: this.selectedAction,
            onComplete: function () {
                console.log(this.selectedValue)
            },
            onCancel: function () {

            }
        };

        this.modal.blocking   = false;
        this.modal.type       = ModalType.Default;
        this.modal.cancelBtn  = 'Cancel';
        this.modal.confirmBtn = 'Continue';
        this.modal.width      = 350;
        this.modal.height     = 300;
    }


}