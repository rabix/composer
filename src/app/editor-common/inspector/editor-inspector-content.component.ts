import {Component} from "@angular/core";
import {EditorInspectorService} from "./editor-inspector.service";

require("./editor-inspector-content.component.scss");

@Component({
    selector: "ct-editor-inspector-content",
    template: `
        <div class="form-section container">
            <div class="row header pt-1 pb-1">
                <div class="col-xs-12">
                    <i class="fa clickable pull-right fa-times"
                       (click)="close()"></i>
                    <h3 class="gui-section-header ">
                        <ng-content select=".tc-header"></ng-content>
                    </h3>
                </div>
            </div>

            <div *ngIf="!collapsed" class="gui-section-body row show">
                <div class="col-xs-12">
                    <ng-content select=".tc-body"></ng-content>
                </div>
            </div>
        </div>
    `
})
export class EditorInspectorContentComponent {

    constructor(private inspector: EditorInspectorService) {

    }

    private close() {
        this.inspector.hide();
    }
}
