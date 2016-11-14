import {Component, Input, ChangeDetectionStrategy} from "@angular/core";

@Component({
    selector: "ct-form-panel",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-section">
            <i class="fa clickable pull-right"
               (click)="toggle()"
               [ngClass]="{
                    'fa-caret-down': !collapsed,
                    'fa-caret-up': collapsed
               }"></i>
               
            <h3 class="gui-section-header">
                <ng-content select=".tc-header"></ng-content> 
            </h3>
             
             <div [class.show]="!collapsed" class="gui-section-body">
                <ng-content select=".tc-body"></ng-content>
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