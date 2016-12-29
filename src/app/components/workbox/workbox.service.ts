import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable()
export class WorkboxService {

    public tabs = new BehaviorSubject([]);

    public activeTab = new BehaviorSubject(undefined);

    public openTab(tab: {
        id: any,
        title: string | Observable<string>,
        contentType: string | Observable<string>,
        contentData: any,
    }) {
        const {tabs}    = this.extractValues();
        let existingTab = tabs.find(existingTab => existingTab.id === tab.id);

        if (existingTab) {
            this.activeTab.next(existingTab);
            return;
        }

        this.tabs.next(tabs.concat(tab));
        this.activeTab.next(tab);

    }

    public closeTab(tab?) {
        if (!tab) {
            tab = this.extractValues().activeTab;
        }

        const currentlyOpenTabs = this.tabs.getValue();
        const tabToRemove       = currentlyOpenTabs.find(t => t.id === tab.id);
        const newTabList        = currentlyOpenTabs.filter(t => t !== tabToRemove);

        this.tabs.next(newTabList);
        this.ensureActiveTab();
    }

    public closeOtherTabs(tab) {
        this.tabs.next([tab]);
        this.activeTab.next(tab);
    }

    public activateNext() {
        const {tabs, activeTab} = this.extractValues();
        const index             = tabs.indexOf(activeTab);
        const newActiveTab      = index === (tabs.length - 1) ? tabs[0] : tabs[index + 1];

        this.activeTab.next(newActiveTab);
    }

    public activatePrevious() {
        const {tabs, activeTab} = this.extractValues();
        const index             = tabs.indexOf(activeTab);
        const newActiveTab      = index ? tabs[index - 1] : tabs[tabs.length - 1];

        this.activeTab.next(newActiveTab);
    }

    private ensureActiveTab() {
        const {tabs, activeTab} = this.extractValues();
        if (!tabs.find(t => t === activeTab)) {
            this.activeTab.next(tabs[tabs.length - 1]);
        }
    }

    private extractValues() {
        return {
            activeTab: this.activeTab.getValue(),
            tabs: this.tabs.getValue()
        }
    }

}
