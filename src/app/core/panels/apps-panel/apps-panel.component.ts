import {AfterViewInit, ChangeDetectorRef, Component} from "@angular/core";
import {UserPreferencesService} from "../../../services/storage/user-preferences.service";

@Component({
    selector: "ct-apps-panel",
    template: `
        <ct-tab-selector distribute="equal" [active]="activeTab" (activeChange)="changeTab($event)">
            <ct-tab-selector-entry [tabName]="'myApps'">My Projects</ct-tab-selector-entry>
            <ct-tab-selector-entry [tabName]="'publicApps'">Public Apps</ct-tab-selector-entry>
        </ct-tab-selector>

        <div class="panel-container" [class.hidden]="activeTab !== 'myApps'">
            <ct-my-apps-panel></ct-my-apps-panel>
        </div>

        <div class="panel-container" [class.hidden]="activeTab !== 'publicApps'">
            <ct-public-apps-panel></ct-public-apps-panel>
        </div>
    `,
    styleUrls: ["./apps-panel.component.scss"],
})
export class AppsPanelComponent implements AfterViewInit {


    activeTab = "myApps";

    constructor(private prefs: UserPreferencesService, private cdr: ChangeDetectorRef) {
    }

    changeTab(tab) {
        if (tab !== this.activeTab) {
            this.prefs.put("selectedAppPanel", tab);
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

                this.activeTab = tabName;

                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
        });

    }
}
