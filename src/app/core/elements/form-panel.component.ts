import {Component, Input, ChangeDetectionStrategy} from "@angular/core";

require("./form-panel.component.scss");
@Component({
    selector: "ct-form-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-section container">
            <div class="row">
                <div class="col-xs-12">
                    <i class="fa clickable pull-right"
                       (click)="toggle()"
                       [ngClass]="{
                            'fa-caret-down': !collapsed,
                            'fa-caret-up': collapsed
                       }"></i>
                    <h3 class="gui-section-header clickable" (click)="collapsed = !collapsed">
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
export class FormPanelComponent {

    @Input()
    public collapsed = false;

    private toggle() {
        this.collapsed = !this.collapsed;
    }
}
