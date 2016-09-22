import {Component} from "@angular/core";

require("./tool-header.component.scss");

@Component({
    selector: "tool-header",
    template: `
            <button type="button" class="btn btn-secondary btn-sm save-button">Save</button>
    `
})
export class ToolHeaderComponent {
}
