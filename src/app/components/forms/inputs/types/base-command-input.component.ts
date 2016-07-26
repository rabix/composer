import {Component, OnInit} from "@angular/core";

require("./base-command-input.component.scss");

@Component({
    selector: 'base-command-input',
    template: `
            <div class="input-group">
                <input name="baseCommand"
                    type="text" 
                    class="form-control"
                    [(ngModel)]="baseCommand">
                    
                    <span class="input-group-addon addExpression">
                        <a href="#">Add expression</a>
                    </span>
            </div>
            <a href="#">Add base command</a>
   `
})
export class BaseCommandInput implements OnInit {
    baseCommand: string;
    
    constructor() { }

    ngOnInit(): void {

    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        this.baseCommand = data ? data : null;
    }
}
