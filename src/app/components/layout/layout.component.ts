import {Component, OnInit, ViewChild, ElementRef, Input, Output} from "@angular/core";
import {WorkspaceComponent} from "../workspace/workspace.component";
import {Subscription, Observable, Subject} from "rxjs";

require("./layout.component.scss");

@Component({
    selector: "ct-layout",
    directives: [WorkspaceComponent],
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
                <workspace class="flex-row" [resize]="resize"></workspace>
            </div>
        </div>
    `
})
export class LayoutComponent implements OnInit {

    @ViewChild("tree")
    private tree: ElementRef;

    @Input()
    private treeSize = 0.35;

    @ViewChild("tabs")
    private tabs: ElementRef;

    @Input()
    private tabsSize = 0.65;

    @ViewChild("handle")
    private handle: ElementRef;

    @Output()
    private resize: Subject<{treeSize: number, tabsSize: number}>;

    private subs: Subscription[] = [];

    constructor() {
        this.resize = new Subject();

    }

    ngOnInit() {

        const down = Observable.fromEvent(this.handle.nativeElement, "mousedown");
        const up   = Observable.fromEvent(document, "mouseup");
        const move = Observable.fromEvent(document, "mousemove");
        const drag = down.flatMap(_ => move.map(e => e.clientX).takeUntil(up));

        drag.map(x => x < 200 ? 200 : x).subscribe(x => {

            const docWidth = document.body.clientWidth;

            this.treeSize = x;
            this.tabsSize = docWidth - x;

            this.resize.next({
                treeSize: this.treeSize,
                tabsSize: this.tabsSize
            });
        });
    }


}