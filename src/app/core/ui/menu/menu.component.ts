import {Component, Input, ElementRef} from "@angular/core";
import {MenuItem} from "./menu-item";

require("./menu.component.scss");

@Component({
    selector: "ct-menu",
    template: `
        <ct-menu-item *ngFor="let item of items" [item]="item"></ct-menu-item>
    `
})
export class MenuComponent {
    @Input()
    private items;

    private el;

    constructor(el: ElementRef) {
        this.el = el.nativeElement;
    }

    public setItems(items: MenuItem[]) {
        this.items = items;
    }

    ngAfterViewInit() {
        // Reposition component if out of screen
        if ((window.innerHeight - this.el.offsetTop) < this.el.clientHeight) {
            this.el.style.top = this.el.offsetTop - this.el.clientHeight + "px";
        }
    }
}
