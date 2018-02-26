import {Component, Input} from "@angular/core";

@Component({

    selector: "ct-form-panel",
    styleUrls: ["./form-panel.component.scss"],
    template: `
        <div class="form-section pl-1 pr-1">
            <i class="fa clickable pull-right"
               (click)="toggle()"
               [ngClass]="{
                            'fa-caret-down': !collapsed,
                            'fa-caret-up': collapsed
                       }"></i>
            <div class="text-title clickable" data-test="panel-title" (click)="collapsed = !collapsed">
                <ng-content select=".tc-header"></ng-content>
            </div>

            <div *ngIf="!collapsed" class="gui-section-body mt-1 show">
                <ng-content select=".tc-body"></ng-content>
            </div>
        </div>
    `
})
export class FormPanelComponent {

    @Input()
    collapsed = false;

    toggle() {
        this.collapsed = !this.collapsed;
    }
}
