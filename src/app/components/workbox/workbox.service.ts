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
            this.activateTab(existingTab);
            return;
        }

        this.tabs.next(tabs.concat(tab));
        this.activateTab(tab);

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
        this.activateTab(tab);
    }

    public closeAllTabs() {
        this.tabs.next([]);
    }

    public activateNext() {
        const {tabs, activeTab} = this.extractValues();
        const index             = tabs.indexOf(activeTab);
        const newActiveTab      = index === (tabs.length - 1) ? tabs[0] : tabs[index + 1];

        this.activateTab(newActiveTab);
    }

    public activatePrevious() {
        const {tabs, activeTab} = this.extractValues();
        const index             = tabs.indexOf(activeTab);
        const newActiveTab      = index ? tabs[index - 1] : tabs[tabs.length - 1];

        this.activateTab(newActiveTab);
    }

    private ensureActiveTab() {
        const {tabs, activeTab} = this.extractValues();
        if (!tabs.find(t => t === activeTab)) {
            this.activateTab(tabs[tabs.length - 1]);
        }
    }

    private extractValues() {
        return {
            activeTab: this.activeTab.getValue(),
            tabs: this.tabs.getValue()
        }
    }

    private activateTab(tab) {
        if (this.activeTab.getValue() === tab) {
            return;
        }

        this.activeTab.next(tab);
    }

}
