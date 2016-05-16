import {Component, ViewContainerRef} from "@angular/core";
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
    private actions: Object[]
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

        this.selectedAction = this.actions[1];
    }

    ngOnInit() {
        this.initModal();

        console.log('actions ' + this.actions);
    }

    newFileDialog() {
        this.modal.show().then((result) => {
            console.log('res ' + result);
        });
    }

    initModal() {
        this.modal.message = `
        <h4>Create New App</h4>
        
        <form>
            <fieldset class="form-group">
                <label for="fileName">Enter file name</label>
                <input type="text" class="form-control" id="fileName" placeholder="File Name">
            </fieldset>
      
            <!--
                TODO: !!!This is a temporary solution until I figure out how to pass data here
            -->
            <!--<fieldset *ngIf="selectOptions.length > 0" class="form-group">
                <label for="create_file_action">{{selectLabel}}</label>
                    <select class="form-control" id="create_file_action" [(ngModel)]="selectedValue">
                        <option *ngFor="let value of selectOptions" [value]="value">{{value.name}}</option>
                    </select>
            </fieldset>-->
        </form>
        `;

        this.modal.selectLabel = 'Action Type';
        this.modal.selectOptions = this.actions;
        this.modal.selectedValue = this.selectedAction;

        this.modal.blocking = false;
        this.modal.type = ModalType.Default;
        this.modal.cancelBtn = 'Cancel';
        this.modal.confirmBtn = 'Continue';
        this.modal.width = 350;
        this.modal.height = 300;
    }

}
