import {Component, Input, OnInit} from "@angular/core";
require("./editor-sidebar-item.component.scss");

@Component({
    selector: "editor-sidebar-item",
    host: {
        "class": "editor-sidebar-item clickable"
    },
    template: `
        <i class="fa fa-{{ icon }} fa-2x"></i>
        <div class="title">{{ title }}</div>
    `
})
export class EditorSidebarItemComponent implements OnInit {
    ngOnInit(): any {
    }

    @Input() title;
    @Input() icon;

}
