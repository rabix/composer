import {Component, Input} from "@angular/core";

@Component({
  selector: 'ct-tab-component',
  template: `
    <div [class.hidden]="!active" class="pane">
        <ng-content></ng-content>
    </div>
  `
})
export class TabComponent {
    @Input('tabTitle')
    title: string;

    @Input()
    active = false;
}
