import {Component} from "@angular/core";
import {ACTION_BUTTON_TYPE} from "../common/action-buttons/action-button-type";
import {NewFileButtonComponent} from "../common/action-buttons/new-file-button.component";

require("./action-panel.component.scss");

@Component({
    selector: "action-panel",
    directives: [NewFileButtonComponent],
    template: `
    <nav>
        <new-file-button [buttonType]="buttonType"></new-file-button>      
    </nav>
       `,
    providers: [],
})
export class ActionPanelComponent {
    private buttonType: string = ACTION_BUTTON_TYPE.PANEL_ITEM;

    constructor() {}
}
