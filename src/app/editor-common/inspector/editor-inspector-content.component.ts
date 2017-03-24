import {Component, Input, ViewEncapsulation} from "@angular/core";
import {EditorInspectorService} from "./editor-inspector.service";

@Component({
    selector: "ct-editor-inspector-content",
    styleUrls: ["./editor-inspector-content.component.scss"],
    template: `
        <div class="form-section pl-1 pr-1">
            <div class="row header pt-1 pb-1">
                <div class="col-xs-12">
                    <i class="fa clickable pull-right fa-times"
                       (click)="close()"></i>
                    <h3 class="gui-section-header">
                        <ng-content select=".tc-header"></ng-content>
                    </h3>
                </div>
            </div>

            <div *ngIf="!collapsed" class="gui-section-body row show">
                <div class="col-xs-12">
                    <ng-content class="col-xs-12" select=".tc-body"></ng-content>
                </div>
            </div>
        </div>
    `
})
export class EditorInspectorContentComponent {

    @Input()
    collapsed = false;

    constructor(private inspector: EditorInspectorService) {

    }

    close() {
        this.inspector.hide();
    }
}
