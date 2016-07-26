import {Component, OnInit} from "@angular/core";
import {BaseCommandInput} from "../types/base-command-input.component";
import {InputFromComponent} from "./input-form.component";

@Component({
    selector: 'base-command-form',
    directives: [BaseCommandInput, InputFromComponent],
    template: `
            <input-form [primaryLabel]="'Base Command'" 
                        [secondaryLabel]="'What command do you want to call from the image'"
                        [inputData]="inputData"
                        [contentComponent]="contentComponent">
            </input-form>
    `
})
export class BaseCommandForm implements OnInit {
    contentComponent = BaseCommandInput;
    inputData: any;

    constructor() {}

    ngOnInit(): void {

    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        this.inputData = data
    }

}
