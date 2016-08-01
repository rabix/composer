import {Component} from "@angular/core";
import {BaseCommandInputComponent} from "../types/base-command-input.component";

@Component({
    selector: 'base-command-form',
    directives: [BaseCommandInputComponent],
    template: `
             <form id="baseCommandForm">
                    <fieldset class="form-group">
                          <button type="button" class="btn btn-secondary hideBtn">Hide</button>
                   
                            <label>Base Command</label>
                            <label class="secondaryLabel">What command do you want to call from the image</label>
                            
                            <base-command-input [baseCommand]="baseCommand"></base-command-input>
                    </fieldset>
                </form>
    `
})
export class BaseCommandFormComponent {
    private baseCommand: string;

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        this.baseCommand = data.command ? data.command : '';
    }

}
