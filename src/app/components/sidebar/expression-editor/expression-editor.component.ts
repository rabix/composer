import {Component} from "@angular/core";

require ("./expression-editor.component.scss");

@Component({
    selector: "expression-editor",
    template: `
        <div class="expression-editor-component">
            This is the expression Editor
        </div>
    `
})
export class ExpressionEditorComponent {

    constructor() { }
}
