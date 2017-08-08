import {AfterContentInit, Component, ContentChildren, QueryList, ViewEncapsulation} from "@angular/core";
import {TabComponent} from "./tab.component";

@Component({
  selector: "ct-tabs-component",
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ["./tabs.component.scss"],
  template: `
    <div class="row ct-tabs-component">
        <div class="signle-tab col-sm-4" *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active">
            <a href="#">{{tab.title}}</a>
        </div>
    </div>
    <ng-content></ng-content>
  `
})
export class TabsComponent implements AfterContentInit {

    @ContentChildren(TabComponent)
    tabs: QueryList<TabComponent>;

    // contentChildren are set
    ngAfterContentInit() {
        // get all active tabs
        const activeTabs = this.tabs.filter((tab) => tab.active);

        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: TabComponent){
        // deactivate all tabs
        this.tabs.toArray().forEach(tab => tab.active = false);

        // activate the tab the user has clicked on.
        tab.active = true;
    }

}
