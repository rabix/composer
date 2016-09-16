import {Component, OnInit} from "@angular/core";

require("./workbox.component.scss");

@Component({
    host: {class: "ct-workbox"},
    selector: 'ct-workbox',
    template: `
        <div class="column tree"></div>
        <div class="column files"></div>
    `
})
export class WorkboxComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }

}