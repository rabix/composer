import {Component, HostBinding, HostListener, Input, OnInit} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {TabSelectorService} from "../tab-selector.service";

@Component({
    selector: "ct-tab-selector-entry",
    template: "<ng-content></ng-content>",
})
export class TabSelectorEntryComponent extends DirectiveBase implements OnInit {

    @Input()
    @HostBinding("class.disabled")
    disabled = false;

    @Input()
    @HostBinding("class.active")
    active = false;

    @Input()
    tabName: string;

    constructor(private selector: TabSelectorService) {
        super();
    }

    @HostListener("click")
    onClick() {
        if (this.disabled) {
            return;
        }
        this.selector.selectedTab.next(this.tabName);
    }

    ngOnInit() {
        this.tracked = this.selector.selectedTab.subscribe(tabName => {
            this.active = this.tabName === tabName;
        });
    }
}
