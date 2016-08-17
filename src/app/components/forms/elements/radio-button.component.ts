import {Component, ChangeDetectionStrategy, Input, Output, HostListener} from "@angular/core";
import {Observable, Subject} from "rxjs/Rx";
require("./radio-button.component.scss");

@Component({
    selector: "ct-radio-button",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        "class": "ct-radio-button btn"
    },
    template: `
        <div class="icon"><i class="fa fa-2x fa-{{ icon }}"></i></div>
        <div class="name">{{ name }}</div>
    `
})
export class RadioButtonComponent<T> {
    @Input()
    public icon: string;

    @Input()
    public name: string;

    @Input()
    public value: T;

    @Output()
    public onClick: Observable<RadioButtonComponent<T>>;

    constructor() {
        this.icon = "";
        this.name = "";

        this.onClick = new Subject<RadioButtonComponent<T>>();
    }

    @HostListener("click")
    public onHostClick() {
        (this.onClick as Subject<RadioButtonComponent<T>>).next(this);
    }
}
