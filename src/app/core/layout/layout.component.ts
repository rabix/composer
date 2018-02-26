import {Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {StatusBarComponent} from "../../layout/status-bar/status-bar.component";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {DomEventService} from "../../services/dom/dom-event.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {LayoutService} from "./layout.service";
import {map} from "rxjs/operators";

@Component({
    selector: "ct-layout",
    styleUrls: ["./layout.component.scss"],
    template: `
        <ct-notification-bar>
        </ct-notification-bar>

        <div class="main-content">

            <!--Panels Column-->
            <div class="panel-column" [style.flexGrow]="treeSize"
                 [class.hidden]="layoutService.sidebarHidden">

                <ct-logo class="pl-1 logo title-bar-section"></ct-logo>
                <ct-panel-container class="layout-section">
                    <ct-apps-panel class="panel"></ct-apps-panel>
                </ct-panel-container>
            </div>

            <!--Panel/Content Resize Handle-->
            <div #handle class="handle-vertical"
                 [class.hidden]="layoutService.sidebarHidden">
            </div>

            <!--Editor Content Column-->
            <ct-workbox [style.flexGrow]="tabsSize" class=""></ct-workbox>

        </div>

        <ct-status-bar #statusBar class="layout-section"></ct-status-bar>
    `
})
export class LayoutComponent extends DirectiveBase implements OnInit {

    /** Flex ratio of the left part of the layout */
    @Input()
    treeSize = 1;

    /** Flex ratio of the document part of the layout */
    @Input()
    tabsSize = 4;

    /** Draggable column separator, handled via it's native element reference */
    @ViewChild("handle")
    private handle: ElementRef;

    @ViewChild(StatusBarComponent)
    private statusBarComponent;

    private el: Element;

    constructor(private domEvents: DomEventService,
                private statusBar: StatusBarService,
                public layoutService: LayoutService,
                el: ElementRef) {
        super();

        this.el = el.nativeElement;
    }

    ngOnInit() {
        this.statusBar.host = this.statusBarComponent;

        // Layout is resizable, so we need to react when user drags the handle
        this.domEvents.onMove(this.handle.nativeElement).pipe(
            map(ev => {
                const x = ev.clientX;

                // You can't make the left column narrower than 200px
                const leftMargin = 200;

                // And you can't make the right column narrower than 400px
                const rightMargin = document.body.clientWidth - 400;

                // So if you've reached the limit, stop updating the aspect ratio
                if (x < leftMargin) {
                    return leftMargin;
                } else if (x > rightMargin) {
                    return rightMargin;
                }

                // Otherwise, return how wide the left column should be
                return x;
            })
        ).subscribeTracked(this, x => {
                // Take the width of the window
                const docWidth = document.body.clientWidth;
                // Set tree width to the given x
                this.treeSize  = x;
                // And fill document area with the rest
                this.tabsSize  = docWidth - x;
            });
    }
}
