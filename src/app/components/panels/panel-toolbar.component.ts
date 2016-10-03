import {Component, OnInit} from "@angular/core";

@Component({
    selector: "ct-panel-toolbar",
    template: `
        <div class="title">
            <ng-content select="name"></ng-content>
        </div>
        <div class="tools">
            <span class="clickable"><i class="fa fa-fw fa-cog"></i></span>
            <span class="clickable"><i class="fa fa-fw fa-sort"></i></span>
        </div>
              
    `
})
export class PanelToolbarComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }

}