import {Component} from "@angular/core";
import {ModalComponent} from "../../modal/modal.component";
import {ActionButtonComponent} from "./action-button.component";

@Component({
    selector: 'save-button',
    template: `
        <action-button class="nav-link" 
                        title="Save" 
                        iconClass="fa fa-save fa-lg"
                        (click)="openModal()">
        </action-button>
    `,
    providers: [ModalComponent],
    directives: [ActionButtonComponent]
})
export class SaveButtonComponent {
    
}