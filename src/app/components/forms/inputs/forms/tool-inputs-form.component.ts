import {Component} from "@angular/core";

require("./form.components.scss");

@Component({
    selector: 'tool-inputs-form',
    template: `
            <form>
                <fieldset class="form-group">               
                       <label>Input ports</label>
                       <input type="text" class="form-control">
                </fieldset>
            </form>
    `
})
export class ToolInputsFormComponent {

}
