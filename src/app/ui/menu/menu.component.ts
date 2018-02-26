import {AfterViewInit, Component, ElementRef, Input, ViewEncapsulation} from "@angular/core";
import {MenuItem} from "./menu-item";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-menu",
    styleUrls: ["./menu.component.scss"],
    template: `
        <ct-menu-item *ngFor="let item of items" [item]="item"></ct-menu-item>
    `
})
export class MenuComponent implements AfterViewInit {
    @Input()
    items;

    private el;

    constructor(el: ElementRef) {
        this.el = el.nativeElement;
    }

    setItems(items: MenuItem[]) {
        this.items = items;
    }

    ngAfterViewInit() {
        // Reposition component if out of screen
        if ((window.innerHeight - this.el.offsetTop) < this.el.clientHeight) {
            this.el.style.top = this.el.offsetTop - this.el.clientHeight + "px";
        }
    }
}
