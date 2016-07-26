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
                        <a href="#" (click)="openExpressionSidebar()">Add expression</a>
                    </span>
                    
            </div>
            <a href="#">Add base command</a>
            
            <!--TODO: move this to a re-sizable sidebar-->
             <div *ngIf="isAddExpressionVisible">
             
                <div class="input-group">
                    <input type="text" 
                        class="form-control"
                        [(ngModel)]="newExpression">
                    
                    <span class="input-group-addon">
                        <div class="icon closeIcon" (click)="closeExpressionSidebar()">
                                <i class="fa fa-lg fa-times"></i>
                        </div>
                    </span>
                </div>
                
            </div>
   `
})
export class BaseCommandInput implements OnInit {
    baseCommand: string;
    newExpression: string;
    isAddExpressionVisible: boolean = false;

    constructor() { }

    ngOnInit(): void {

    }

    openExpressionSidebar() {
        this.isAddExpressionVisible = true;
    }

    closeExpressionSidebar() {
        this.isAddExpressionVisible = false;
    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        this.baseCommand = data ? data : null;
    }
}
