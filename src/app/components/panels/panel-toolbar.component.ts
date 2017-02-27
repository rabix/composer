import {Component, OnInit, ViewEncapsulation} from "@angular/core";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-panel-toolbar",
    template: `
        <div class="title">
            <ng-content select=".tc-name"></ng-content>
        </div>
        <div class="tools">
            <ng-content select=".tc-tools"></ng-content>
        </div>
    `
})
export class PanelToolbarComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }

}
