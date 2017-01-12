import {Component, OnInit, ViewChild, ElementRef, Input} from "@angular/core";
import {BehaviorSubject, Subscription} from "rxjs";
import {DomEventService} from "../../services/dom/dom-event.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ComponentBase} from "../common/component-base";
import {
    PanelGroup,
    PanelStatus,
    PANEL_USER_PROJECTS,
    PANEL_PUBLIC_APPS,
    PANEL_STRUCTURE,
    PanelGroupMap,
    PANEL_LOCAL_FILES
} from "./layout.types";
import {StatusBarService} from "../../core/status-bar/status-bar.service";
import {StatusBarComponent} from "../../core/status-bar/status-bar.component";
import {WorkboxService} from "../workbox/workbox.service";


require("./layout.component.scss");

@Component({
    selector: "ct-layout",
    providers: [StatusBarService, WorkboxService],
    template: `
        <div class="main-container">
            
            <div class="not-status-bar">
            
                <!--Panel Switch Column-->
                <div>
                    <div class="top-bar"></div>
                    <div class="left-panel-bar">
                    
                        <ct-panel-switcher [panels]="(panelSwitches | async)?.top.panels" 
                                           (statusChange)="onPanelSwitch($event, 'top')"></ct-panel-switcher>
                        
                        <ct-panel-switcher [panels]="(panelSwitches | async)?.bottom.panels" 
                                           (statusChange)="onPanelSwitch($event, 'bottom')"></ct-panel-switcher>                                       
                           
                    </div>
                    
                    <div class="toggle-panel-left">
                        <i aria-hidden="true" class="fa fa-caret-square-o-left" 
                        (click) = "togglePanelLeft()"></i>                    
                    </div> 
                </div>
                
                <!--Panels Column-->
                <div class="flex-col col-panels" 
                     [style.flex]="treeSize"
                     [class.hidden]="(visiblePanels | async).length === 0">
                     
                    <div class="top-bar fixed">
                        <div class="seven-bridges-logo"></div>
                    </div>
                    
                    <ct-panel-container [panels]="panels" class="flex-row"></ct-panel-container>
                </div>
                
                <!--Panel/Content Resize Handle-->
                <div #handle class="handle-vertical" [class.hidden]="(visiblePanels | async).length === 0"></div>
                
                <!--Editor Content Column-->
                <div class="flex-col workbox-col" [style.flex]="tabsSize">
                    <ct-workbox class="flex-col"></ct-workbox>
                </div>
                
            </div>
            
            <ct-status-bar #statusBar class="layout-section"></ct-status-bar>
          
        </div>
    `
})
export class LayoutComponent extends ComponentBase implements OnInit {

    /** Flex ratio of the left part of the layout */
    @Input()
    private treeSize = 1;

    /** Flex ratio of the document part of the layout */
    @Input()
    private tabsSize = 4;

    /** Draggable column separator, handled via it's native element reference */
    @ViewChild("handle")
    private handle: ElementRef;

    @ViewChild(StatusBarComponent)
    private statusBarComponent;

    /** Tracking all available panel states */
    protected panels = new BehaviorSubject<PanelStatus[]>([]);

    /** Tracking visible panels so we know whether to show or hide the panel block */
    protected visiblePanels = new BehaviorSubject<PanelStatus[]>([]);

    /** Tracking the panel switches so we know which ones to highlight and where to put them */
    protected panelSwitches: BehaviorSubject<PanelGroupMap>;

    private el: Element;

    constructor(private preferences: UserPreferencesService,
                private domEvents: DomEventService,
                private statusBar: StatusBarService,
                el: ElementRef) {
        super();

        this.el = el.nativeElement;

        const top = new PanelGroup([
            new PanelStatus(PANEL_LOCAL_FILES, "1: Local Files", "folder", false, "alt+1"),
            new PanelStatus(PANEL_USER_PROJECTS, "2: Projects", "folder", false, "alt+2"),
            new PanelStatus(PANEL_PUBLIC_APPS, "3: Public Apps", "code", false, "alt+3"),
        ]);

        const bottom = new PanelGroup([
            new PanelStatus(PANEL_STRUCTURE, "7: Structure", "list", false, "alt+7")
        ]);

        this.panelSwitches = new BehaviorSubject({top, bottom});

        // Retrieve state of opened panels from local storage
        this.tracked = this.preferences.get("open-tabs", [top.panels[0].id])
            .subscribe(tabs => tabs.forEach(panelId => this.switchPanel(panelId)));
    }

    ngOnInit() {

        this.statusBar.host = this.statusBarComponent;

        // Layout is resizable, so we need to react when user drags the handle
        this.tracked = this.domEvents.onDrag(this.handle.nativeElement)
            .map(ev => {
                const x = ev.clientX;

                // You can't make the left column narrower than 200px
                const leftMargin = 200;

                // And you can't make the right column narrower than 400px
                const rightMargin = document.body.clientWidth - 400;

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
            });


        // Flatten the grouped switches into an array
        const allSwitches = this.panelSwitches.map(p => [].concat(...Object.keys(p).map(k => p[k].panels)));

        // Pass all switches down to panels
        this.tracked = allSwitches.subscribe(this.panels);


        // Pass only active switches as visible panels
        this.tracked = allSwitches.map(panels => panels.filter(p => p.active)).subscribe(this.visiblePanels);

        // Whenever panels get changed, we want to register the shortcuts
        // we should unregister the old ones because of the check if a shortcut is already registered
        const shortcutSubs: Subscription[] = [];
        this.tracked                       = this.panels.subscribe(panels => {
            // Unsubscribe from all previous subscriptions on these shortcuts
            shortcutSubs.forEach(sub => sub.unsubscribe());
            shortcutSubs.length = 0;

            panels.forEach(group => shortcutSubs.push(
                this.domEvents.onShortcut(group.shortcut).subscribe(_ => this.switchPanel(group.id)))
            );
        });

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

        // Preserve state of opened panels in local storage
        const openedTabsIds = Object.keys(next).reduce((acc, panelGroup) => acc.concat(next[panelGroup].panels), [])
            .filter(panel => panel.active).map(panel => panel.id);
        this.preferences.put("open-tabs", openedTabsIds);

        this.panelSwitches.next(Object.assign({}, next));
    }

    private togglePanelLeft() {
        const next = this.panelSwitches.getValue();
        Object.keys(next)
            .forEach(position => {
                next[position].panels.forEach(panel => panel.active = false);
                this.onPanelSwitch(next[position].panels, position)
            });
    }

    ngAfterViewInit() {

    }
}
