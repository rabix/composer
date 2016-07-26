import {Component, OnInit} from "@angular/core";
import {DockerInputComponent} from "../types/docker-input.component";
import {InputFromComponent} from "./input-form.component";

@Component({
    selector: 'docker-input-form',
    directives: [DockerInputComponent, InputFromComponent],
    template: `
            <input-form [primaryLabel]="'Docker image'" 
                        [secondaryLabel]="'Docker Repository'"
                        [inputData]="inputData"
                        [contentComponent]="contentComponent">
            </input-form>
    `
})
export class DockerInputForm implements OnInit {
    contentComponent = DockerInputComponent;
    inputData: any;

    constructor() { }

    ngOnInit(): void {

    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
            this.inputData = data
    }

}
