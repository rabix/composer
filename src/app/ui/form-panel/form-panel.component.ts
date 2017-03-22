import {ChangeDetectionStrategy, Component, Input} from "@angular/core";

@Component({

    selector: "ct-form-panel",
    styleUrls: ["./form-panel.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-section pl-1 pr-1">
            <i class="fa clickable pull-right"
               (click)="toggle()"
               [ngClass]="{
                            'fa-caret-down': !collapsed,
                            'fa-caret-up': collapsed
                       }"></i>
            <h3 class="gui-section-header clickable" (click)="collapsed = !collapsed">
                <ng-content select=".tc-header"></ng-content>
            </h3>

            <div *ngIf="!collapsed" class="gui-section-body show">
                <ng-content select=".tc-body"></ng-content>
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
