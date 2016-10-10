import {Component, OnInit, ViewChild, ElementRef, Input} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";
import {WorkboxComponent} from "../workbox/workbox.component";
import {PanelSwitcherComponent} from "../panels/panel-switcher.component";
import {PanelContainerComponent} from "../panels/panel-container.component";
import {DomEventService} from "../../services/dom/dom-event.service";
import {
    PanelGroup,
    PanelStatus,
    PANEL_USER_PROJECTS,
    PANEL_PUBLIC_APPS,
    PANEL_STRUCTURE,
    PANEL_REVISIONS,
    PanelGroupMap
} from "./layout.types";

require("./layout.component.scss");

@Component({
    selector: "ct-layout",
    directives: [PanelSwitcherComponent, WorkboxComponent, PanelContainerComponent],
    template: `
        <div class="flex-box">
            <div class="panel-switch-col">
                <div class="top-bar"></div>
                <div class="left-panel-bar">
                
                    <ct-panel-switcher [panels]="(panelSwitches | async)?.top.panels" 
                                       (statusChange)="onPanelSwitch($event, 'top')"></ct-panel-switcher>
                    
                    <ct-panel-switcher [panels]="(panelSwitches | async)?.bottom.panels" 
                                       (statusChange)="onPanelSwitch($event, 'bottom')"></ct-panel-switcher>
                </div>
            </div>
            <div class="flex-col" 
                 [style.flex]="treeSize" 
                 [class.hidden]="(visiblePanels | async).length === 0">
                 
                <div class="top-bar fixed">
                    <div class="seven-bridges-logo"></div>
                </div>
                
                <ct-panel-container [panels]="panels" class="flex-row"></ct-panel-container>
            </div>
            
            <div #handle class="handle-vertical" [class.hidden]="(visiblePanels | async).length === 0"></div>
            
            <div class="flex-col workbox-col" [style.flex]="tabsSize">
                <ct-workbox class="flex-col"></ct-workbox>
            </div>
        </div>
    `
})
export class LayoutComponent implements OnInit {

    /** Flex ratio of the left part of the layout */
    @Input()
    private treeSize = 1;

    /** Flex ratio of the document part of the layout */
    @Input()
    private tabsSize = 4;

    /** Draggable column separator, handled via it's native element reference */
    @ViewChild("handle")
    private handle: ElementRef;

    /** Tracking all available panel states */
    protected panels = new BehaviorSubject<PanelStatus[]>([]);

    /** Tracking visible panels so we know whether to show or hide the panel block */
    protected visiblePanels = new BehaviorSubject<PanelStatus[]>([]);

    /** Tracking the panel switches so we know which ones to highlight and where to put them */
    protected panelSwitches: BehaviorSubject<PanelGroupMap>;

    /** Subscriptions to dispose when component gets destroyed */
    private subs: Subscription[] = [];

    private el: Element;

    constructor(private domEvents: DomEventService, el: ElementRef) {
        this.el = el.nativeElement;

        const top = new PanelGroup([
            new PanelStatus(PANEL_USER_PROJECTS, "1: Projects", "folder", true, "alt+1"),
            new PanelStatus(PANEL_PUBLIC_APPS, "2: Public Apps", "code", false, "alt+2")
        ]);

        const bottom = new PanelGroup([
            new PanelStatus(PANEL_STRUCTURE, "7: Structure", "list", false, "alt+7"),
            new PanelStatus(PANEL_REVISIONS, "8: Revisions", "history", false, "alt+8")
        ]);

        this.panelSwitches = new BehaviorSubject({top, bottom});
    }

    ngOnInit() {

        // Layout is resizable, so we need to react when user drags the handle
        this.subs.push(
            this.domEvents.onDrag(this.handle.nativeElement).map(ev => {
                const x = ev.clientX;

                // You can't make the left column narrower than 200px
                const leftMargin = 200;

                // And you can't make the right column narrower than 200px
                const rightMargin = document.body.clientWidth - 200;

                // So if you've reached the limit, stop updating the aspect ratio
                if (x < leftMargin) {
                    return leftMargin;
                } else if (x > rightMargin) {
                    return rightMargin
                }

                // Otherwise, return how wide the left column should be
                return x;
            }).subscribe(x => {
                // Take the width of the window
                const docWidth = document.body.clientWidth;
                // Set tree width to the given x
                this.treeSize  = x;
                // And fill document area with the rest
                this.tabsSize  = docWidth - x;
            })
        );

        // Flatten the grouped switches into an array
        const allSwitches = this.panelSwitches.map(p => [].concat(...Object.keys(p).map(k => p[k].panels)));

        // Pass all switches down to panels
        this.subs.push(
            allSwitches.subscribe(this.panels)
        );

        // Pass only active switches as visible panels
        this.subs.push(
            allSwitches.map(panels => panels.filter(p => p.active)).subscribe(this.visiblePanels)
        );

        // Whenever panels get changed, we want to register the shortcuts
        // we should unregister the old ones because of the check if a shortcut is already registered
        const shortcutSubs: Subscription[] = [];
        this.subs.push(
            this.panels.subscribe(panels => {
                // Unsubscribe from all previous subscriptions on these shortcuts
                shortcutSubs.forEach(sub => sub.unsubscribe());
                shortcutSubs.length = 0;

                panels.forEach(group => shortcutSubs.push(
                    this.domEvents.onShortcut(group.shortcut).subscribe(_ => this.switchPanel(group.id)))
                );
            })
        );
    }

    /**
     * Toggles the panel with a given ID
     * @param panelId
     */
    public switchPanel(panelId) {
        const panels = Object.assign({}, this.panelSwitches.getValue());

        Object.keys(panels).forEach(region => {
            if (panels[region].has(panelId)) {
                panels[region].toggle(panelId);
            }
        });

        this.panelSwitches.next(panels);
    }

    private onPanelSwitch(panels, position) {

        const next     = this.panelSwitches.getValue();
        next[position] = new PanelGroup(panels);

        this.panelSwitches.next(Object.assign({}, next));
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe())
    }
}