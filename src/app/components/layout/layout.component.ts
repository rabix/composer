import {Component, OnInit, ViewChild, ElementRef, Input} from "@angular/core";
import {Observable, BehaviorSubject} from "rxjs";
import {WorkboxComponent} from "../workbox/workbox.component";
import {PanelSwitcherComponent} from "../panels/panel-switcher.component";
import {PanelContainerComponent} from "../panels/panel-container.component";
import {DomEventService} from "../../services/dom/dom-event.service";

require("./layout.component.scss");

@Component({
    selector: "ct-layout",
    directives: [PanelSwitcherComponent, WorkboxComponent, PanelContainerComponent],
    template: `
        <div class="flex-box">
            <div class="panel-switch-col">
                <div class="top-bar"></div>
                <div class="left-panel-bar">
                
                    <ct-panel-switcher [panels]="(panelSwitches | async)?.top" 
                                       (statusChange)="onPanelSwitch($event, 'top')"></ct-panel-switcher>
                    
                    <ct-panel-switcher [panels]="(panelSwitches | async)?.bottom" 
                                       (statusChange)="onPanelSwitch($event, 'bottom')"></ct-panel-switcher>
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

    private el: Element;

    constructor(private domEvents: DomEventService, el: ElementRef) {
        this.el = el.nativeElement;

        this.panelSwitches.next({
            top: [
                {id: "sb_user_projects", name: "1: Projects", icon: "folder", active: true, shortcut: "alt+1"},
                {id: "sb_public_apps", name: "2: Public Apps", icon: "code", active: false, shortcut: "alt+2"},
            ],
            bottom: [
                {id: "structure", name: "7: Structure", icon: "list", active: false, shortcut: "alt+7"},
                {id: "revisions", name: "8: Revisions", icon: "history", active: false, shortcut: "alt+8"}
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

        this.panelSwitches.map(panels => [
                panels.top.find(p => p.active),
                panels.bottom.find(p => p.active)
            ].filter(p => p)
        ).subscribe(this.visiblePanels);


        this.panels.first().subscribe(panels => {
            panels.forEach(p => {
                this.domEvents.onShortcut(p.shortcut).subscribe(k => {
                    this.switchPanel(p.id);
                });
            })
        })
    }

    public switchPanel(panelId) {
        const panels = Object.assign({}, this.panelSwitches.getValue());
        Object.keys(panels).forEach(region => {
            const panel = panels[region].find(p => p.id === panelId);
            if (!panel) {
                return;
            }
            const newState = !panel.active;

            if (newState === true) {
                panels[region].forEach(p => p.active = false);
            }

            panel.active = newState;
        });

        this.panelSwitches.next(panels);
    }

    private onPanelSwitch(panels, position: "top"|"bottom") {
        this.panelSwitches.next(Object.assign(this.panelSwitches.getValue(), {[position]: panels}));
    }
}