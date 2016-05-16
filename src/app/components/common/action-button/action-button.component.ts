import {Component, Input, OnInit} from "@angular/core";
require("./action-button.component.scss");

@Component({
    selector: "action-button",
    host: {
        "class": "action-button clickable"
    },
    template: `
        <div class="{{ buttonType }}">
            <i class="{{iconClass}}"></i>
            <div class="title">{{ title }}</div>
        </div>
    `
})
export class ActionButtonComponent implements OnInit {
    @Input() title;
    @Input() iconClass;
    @Input() buttonType;
    
    ngOnInit(): any {
    }
}
