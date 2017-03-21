import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from "@angular/core";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";
import {TabSelectorComponent} from "../../../ui/tab-selector/tab-selector.component";

@Component({
    selector: "ct-apps-panel",
    template: `
        <ct-tab-selector distribute="equal" (activeChange)="changeTab($event)">
            <ct-tab-selector-entry [tabName]="'myApps'">My Apps</ct-tab-selector-entry>
            <ct-tab-selector-entry [tabName]="'publicApps'">Public Apps</ct-tab-selector-entry>
        </ct-tab-selector>

        <div class="panel-container" [hidden]="activeTab?.tabName !== 'myApps'">
            <ct-my-apps-panel></ct-my-apps-panel>
        </div>

        <div class="panel-container" [hidden]="activeTab?.tabName !== 'publicApps'">
            <ct-public-apps-panel></ct-public-apps-panel>
        </div>
    `,
    styleUrls: ["./apps-panel.component.scss"],
})
export class AppsPanelComponent implements AfterViewInit {


    activeTab;

    @ViewChild(TabSelectorComponent)
    tabSelector: TabSelectorComponent;

    constructor(private prefs: UserPreferencesService, private cdr: ChangeDetectorRef) {
    }

    changeTab(tab) {
        if (tab) {
            this.prefs.put("selectedAppPanel", tab.tabName);
        }

    }

    ngAfterViewInit() {
        this.prefs.get("selectedAppPanel", "myApps").subscribe(tabName => {

            // Fix badly written data
            if (["myApps", "publicApps"].indexOf(tabName) === -1) {
                this.prefs.put("selectedAppPanel", "myApps");
                tabName = "myApps";
            }

            setTimeout(() => {
                const tab = this.tabSelector.activateTab(tabName);
                console.log("Prefered panel is", tabName, tab);
                this.activeTab = tab;
                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
        });

    }
}
