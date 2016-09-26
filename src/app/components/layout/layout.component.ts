import {Component, OnInit, ViewChild, ElementRef, Input} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {WorkboxComponent} from "../workbox/workbox.component";
import {PanelSwitcherComponent} from "../panels/panel-switcher.component";
import {PanelContainerComponent} from "../panels/panel-container.component";

require("./layout.component.scss");

@Component({
    selector: "ct-layout",
    directives: [PanelSwitcherComponent, WorkboxComponent, PanelContainerComponent],
    template: `
        <div class="flex-box">
            <div class="panel-switch-col">
                <div class="top-bar"></div>
                <div class="left-panel-bar">
                    <ct-panel-switcher [panels]="(panelSwitches | async)?.top" (statusChange)="onPanelSwitch($event, 'top')"></ct-panel-switcher>
                    <ct-panel-switcher [panels]="(panelSwitches | async)?.bottom" (statusChange)="onPanelSwitch($event, 'bottom')"></ct-panel-switcher>
                </div>
            </div>
            <div #tree 
                 class="flex-col" 
                 [style.flex]="treeSize" 
                 [class.hidden]="(visiblePanels | async).length === 0">
                 
                <div class="top-bar fixed">
                    <div class="seven-bridges-logo"></div>
                </div>
                
                <ct-panel-container [panels]="panels" class="flex-row"></ct-panel-container>
            </div>
            
            <div #handle class="handle-vertical" [class.hidden]="(visiblePanels | async).length === 0"></div>
            
            <div class="flex-col workbox-col" #tabs [style.flex]="tabsSize">
                <ct-workbox class="flex-col"></ct-workbox>
            </div>
        </div>
    `
})
export class LayoutComponent implements OnInit {

    @ViewChild("tree")
    private tree: ElementRef;

    @Input()
    private treeSize = 1;

    @ViewChild("tabs")
    private tabs: ElementRef;

    @Input()
    private tabsSize = 4;

    @ViewChild("handle")
    private handle: ElementRef;

    protected panels = new BehaviorSubject([]);

    protected visiblePanels = new BehaviorSubject([]);

    protected panelSwitches = new BehaviorSubject({top: [], bottom: []});

    constructor() {
        this.panelSwitches.next({
            top: [
                {id: "sb_user_projects", name: "Projects", icon: "folder", active: true},
                {id: "sb_public_apps", name: "Public Apps", icon: "code", active: false},
            ],
            bottom: [
                {id: "structure", name: "Structure", icon: "list", active: false},
                {id: "revisions", name: "Revisions", icon: "history", active: false}
            ]
        });
    }

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
            this.treeSize  = x;
            this.tabsSize  = docWidth - x;
        });

        this.panelSwitches.map(panels => [].concat(panels.top, panels.bottom)).subscribe(this.panels);

        this.panelSwitches
            .map(panels => [
                    panels.top.find(p => p.active),
                    panels.bottom.find(p => p.active)
                ].filter(p => p)
            )
            .subscribe(this.visiblePanels);
    }

    private onPanelSwitch(panels, position: "top"|"bottom") {
        this.panelSwitches.next(Object.assign(this.panelSwitches.getValue(), {[position]: panels}));
    }
}