import {Component, ChangeDetectionStrategy, Input, Output, HostBinding, HostListener} from "@angular/core";
import {Observable, Subject} from "rxjs/Rx";
require("./square-button.component.scss");

export interface RadioButtonInterface {

}

@Component({
    selector: "ct-square-btn",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        "class": "ct-square-btn btn"
    },
    template: `
        <div class="icon"><i class="fa fa-2x fa-{{ icon }}"></i></div>
        <div class="title">{{ title }}</div>
    `
})
export class SquareButtonComponent implements RadioButtonInterface{
    @Input()
    public icon: string;

    @Input()
    public title: string;

    @HostBinding("class.btn-primary")
    public isSelected: boolean;

    @Output()
    public onClick: Observable<boolean>;

    constructor() {
        this.icon       = "";
        this.title      = "";
        this.isSelected = false;
        this.onClick    = new Subject();
    }

    @HostListener("click")
    public onHostClick() {
        this.isSelected = true;
        console.debug("Clicked on this button!");
        (this.onClick as Subject).next(this);
    }
}
