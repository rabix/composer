import {Component, Input, OnInit} from "angular2/core";
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
        console.log('Stuff', this.title, this.icon);
    }

    @Input() title;
    @Input() icon;

}
