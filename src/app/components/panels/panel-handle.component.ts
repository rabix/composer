import {Component, ElementRef, Output} from "@angular/core";
import {Observable, Subject} from "rxjs";

@Component({
    selector: "ct-panel-handle",
    template: `<ng-content></ng-content>`
})
export class PanelHandleComponent {

    @Output()
    public onDrag: Observable<MouseEvent> = new Subject<MouseEvent>();

    constructor(private el: ElementRef) {
    }

    ngOnInit() {

        const down = Observable.fromEvent(this.el.nativeElement, "mousedown");
        const up   = Observable.fromEvent(document, "mouseup");
        const move = Observable.fromEvent(document, "mousemove");

        down.flatMap(_ => move.map((e:MouseEvent) => e.clientY).takeUntil(up)).subscribe(this.onDrag as Subject<any>);
    }
}