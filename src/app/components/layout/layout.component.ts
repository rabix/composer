import {Component, OnInit, ViewChild, ElementRef, Input} from "@angular/core";
import {Observable} from "rxjs";

require("./layout.component.scss");

@Component({
    selector: "ct-layout",
    directives: [],
    template: `
        <div class="flex-box">
            <div class="flex-col" #tree [style.flex]="treeSize">
                <div class="top-bar fixed flex-row">
                    <div class="seven-bridges-logo"></div>
                </div>
                <ct-file-tree class="flex-row"></ct-file-tree>
            </div>
            <div class="handle" #handle></div>
            <div class="flex-col" #tabs [style.flex]="tabsSize">
                <ct-workbox class="flex-row"></ct-workbox>
            </div>
        </div>
    `
})
export class LayoutComponent implements OnInit {

    @ViewChild("tree")
    private tree: ElementRef;

    @Input()
    private treeSize = .2;

    @ViewChild("tabs")
    private tabs: ElementRef;

    @Input()
    private tabsSize = .8;

    @ViewChild("handle")
    private handle: ElementRef;

    ngOnInit() {

        const down = Observable.fromEvent(this.handle.nativeElement, "mousedown");
        const up   = Observable.fromEvent(document, "mouseup");
        const move = Observable.fromEvent(document, "mousemove");
        const drag = down.flatMap(_ => move.map(e => e.clientX).takeUntil(up));

        drag.map(x => {
            const leftMargin  = 200;
            const rightMargin = document.body.clientWidth - 200;

            if (x < leftMargin) {
                return leftMargin;
            } else if (x > rightMargin) {
                return rightMargin
            }

            return x;
        }).subscribe(x => {

            const docWidth = document.body.clientWidth;

            this.treeSize = x;
            this.tabsSize = docWidth - x;
        });
    }


}