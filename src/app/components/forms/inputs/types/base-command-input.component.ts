import {Component, OnInit} from "@angular/core";
import {GuiEditorService, GuiEditorEventType, SidebarType} from "../../../gui-editor/gui-editor.service";
import Subscription from "rxjs/Rx";

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
        `
})
export class BaseCommandInput implements OnInit {
    baseCommand: string;

    /** List of subscriptions that should be disposed when destroying this component */
    private subs: Subscription[];

    constructor(private guiEditorService: GuiEditorService) {

    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
    }

    openExpressionSidebar() {
        this.guiEditorService.publishEditorEvent({
            type: GuiEditorEventType.showSidebar,
            data: {
                sidebarType: SidebarType.expression
            }
        });
    }

    /*TODO: use actual model type here*/
    public setState(data: any): void {
        this.baseCommand = data.command ? data.command : '';
    }
}
