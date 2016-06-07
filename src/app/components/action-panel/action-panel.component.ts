import {Component} from "@angular/core";
import {NewFileButtonComponent} from "../common/action-buttons/new-file-button.component";

require("./action-panel.component.scss");

@Component({
    selector: "action-panel",
    directives: [NewFileButtonComponent],
    template: `
    <nav>
        <new-file-button></new-file-button>      
    </nav>
       `,
    providers: [],
})
export class ActionPanelComponent {
    constructor() {}
}
