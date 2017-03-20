import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-form-panel",
    styleUrls: ["./form-panel.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-section pl-1 pr-1">
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

    toggle() {
        this.collapsed = !this.collapsed;
    }
}
