import { Component } from '@angular/core';

require('./form-section.component.scss');
/**
 * @deprecated Use {@link FormPanelComponent} from the Core module instead.
 * It's the same as this one. Moving stuff to the core module and writing tests.
 */
@Component({
    selector: 'ct-form-section',
    template: `
<div class="form-section">
    <i class="fa hide-button clickable"
       (click)="toggleBody()"    
       [ngClass]="{'fa-caret-down': show, 'fa-caret-up': !show}"></i>
    <h3 class="gui-section-header">
        <ng-content select=".tc-header"></ng-content>
    </h3>
    
    <div [ngClass]="{show: show}" class="gui-section-body">
        <ng-content select=".tc-body"></ng-content>
    </div>
</div>
`
})
export class FormSectionComponent {
    private show = true;

    private toggleBody() {
        this.show = !this.show;
    }
}