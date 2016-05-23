import {Component} from "@angular/core";
import {ACTION_BUTTON_TYPE} from "../common/action-button/action-button-type";
import {ActionButtonComponent} from "../common/action-button/action-button.component";
import {ModalComponent, ModalType} from '../modal/modal.component';

require("./action-panel.component.scss");

@Component({
    selector: "action-panel",
    directives: [ActionButtonComponent],
    template: `
    <nav>
        <action-button class="nav-link" 
                            title="New File" 
                            buttonType="{{ACTION_BUTTON_TYPE.PANEL_ITEM}}" 
                            iconClass="fa fa-file fa-lg"
                            (click)="newFileDialog()">
        </action-button>
    </nav>
       `,
    providers: [ModalComponent],
})
export class ActionPanelComponent {
    private ACTION_BUTTON_TYPE;
    private actions: Object[];
    private selectedAction: Object;

    constructor(private modal:ModalComponent) {
        this.ACTION_BUTTON_TYPE = ACTION_BUTTON_TYPE;

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

    ngOnInit() {
        this.initModal();
    }

    newFileDialog() {
        this.modal.show();
    }

    initModal() {
        this.modal.dynamicTemplateString = `
        <h4>Create New App</h4>
        
        <form>
            <fieldset class="form-group">
                <label for="fileName">Enter file name</label>
                <input type="text" class="form-control" id="fileName" placeholder="File Name">
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
            onComplete: function() {
               console.log(this.selectedValue)
            },
            onCancel: function() {
                
            }
        };

        this.modal.blocking = false;
        this.modal.type = ModalType.Default;
        this.modal.cancelBtn = 'Cancel';
        this.modal.confirmBtn = 'Continue';
        this.modal.width = 350;
        this.modal.height = 300;
    }

}
