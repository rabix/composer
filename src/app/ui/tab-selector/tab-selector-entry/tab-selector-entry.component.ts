import {Component, HostBinding, HostListener, Input} from "@angular/core";
import {TabSelectorService} from "../tab-selector.service";

@Component({
    selector: "ct-tab-selector-entry",
    template: "<ng-content></ng-content>",
})
export class TabSelectorEntryComponent {

    @Input()
    @HostBinding("class.disabled")
    disabled = false;

    @HostBinding("class.active")
    active = false;

    @Input()
    tabName: string;

    constructor(private selector: TabSelectorService) {
        selector.selectedTab.subscribe(tab => this.active = tab === this);
    }

    @HostListener("click")
    onClick() {
        if (this.disabled) {
            return;
        }
        this.selector.selectedTab.next(this);
    }
}
