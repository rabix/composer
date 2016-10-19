import {OnInit, Component, Input, ElementRef, Renderer} from "@angular/core";
import {Observable} from "rxjs";

require("./panel.component.scss");

@Component({
    host: {
        "class": "panel"
    },
    selector: "ct-panel",
    template: `<ng-content></ng-content>`
})

export class PanelComponent implements OnInit {

    @Input()
    public size: Observable<number>;

    constructor(private el: ElementRef, private renderer: Renderer) {

    }

    ngOnInit() {
        this.size.subscribe(s => this.setSize(s));
    }

    public setSize(number) {
        this.renderer.setElementStyle(this.el.nativeElement, "flex", number);
    }

    public getSize(){
        return this.el.nativeElement.style.flex;
    }

}