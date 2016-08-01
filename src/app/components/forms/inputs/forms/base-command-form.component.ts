import {Component} from "@angular/core";
import {BaseCommandInputComponent} from "../types/base-command-input.component";
import {InputFromComponent} from "./input-form.component";

@Component({
    selector: 'base-command-form',
    directives: [BaseCommandInputComponent, InputFromComponent],
    template: `
            <input-form [primaryLabel]="'Base Command'" 
                        [secondaryLabel]="'What command do you want to call from the image'"
                        [inputData]="inputData"
                        [contentComponent]="contentComponent">
            </input-form>
    `
})
export class BaseCommandFormComponent {
    private contentComponent = BaseCommandInputComponent;
    private inputData: any;
    
    /*TODO: use actual model type here*/
    public setState(data: any): void {
        this.inputData = data
    }

}
