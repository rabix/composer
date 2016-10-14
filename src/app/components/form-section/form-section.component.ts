import { Component } from '@angular/core';

require('./form-section.component.scss');

@Component({
    selector: 'ct-form-section',
    template: `
<div class="form-section">
    <i class="fa hide-button clickable"
       (click)="toggleBody()"    
       [ngClass]="{'fa-caret-down': show, 'fa-caret-up': !show}"></i>
    <h3 class="gui-section-header">
        <ng-content select="header"></ng-content>
    </h3>
    
    <div [ngClass]="{show: show}" class="gui-section-body">
        <ng-content select="body"></ng-content>
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