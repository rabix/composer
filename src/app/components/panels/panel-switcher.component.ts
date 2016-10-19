import {Component, Output, Input, ChangeDetectionStrategy} from "@angular/core";
import {ReplaySubject} from "rxjs";

require("./panel-switcher.component.scss");

@Component({
    selector: "ct-panel-switcher",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div *ngFor="let p of panels" 
             class="switcher clickable unselectable top" 
             (click)="toggle(p)"
             [class.active]="p.active">
             
            <div class="switcher-text">
                <i class="switcher-icon fa fa-fw fa-{{ p.icon }}"></i>
                {{ p.name }}
            </div>
        </div>
    `
})
export class PanelSwitcherComponent {

    @Input()
    private panels: [{
        id: string,
        name: string,
        icon: string,
        active: boolean
    }];

    @Output()
    private statusChange = new ReplaySubject(1);

    ngOnInit() {
        this.statusChange.next(this.panels);
    }

    private toggle(panel) {

        const newState = !panel.active;

        this.panels.forEach(p => p.active = false);
        panel.active = newState;
        this.statusChange.next(this.panels);
    }
}