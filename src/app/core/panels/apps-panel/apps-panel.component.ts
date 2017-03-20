import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";

@Component({
    selector: "ct-apps-panel",
    template: `
        <ct-tab-selector distribute="equal" [active]="myAppsTab" (activeChange)="activeTab = $event">
            <ct-tab-selector-entry #myAppsTab>My Apps</ct-tab-selector-entry>
            <ct-tab-selector-entry #publicAppsTab>Public Apps</ct-tab-selector-entry>
        </ct-tab-selector>

        <div class="panel-container" [hidden]="activeTab !== myAppsTab">
            <ct-my-apps-panel></ct-my-apps-panel>
        </div>

        <div class="panel-container p-1" [hidden]="activeTab !== publicAppsTab">
            <ct-search-field [placeholder]="'Search Public Apps...'"></ct-search-field>
        </div>
    `,
    styleUrls: ["./apps-panel.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsPanelComponent implements OnInit {

    activeTab: any;

    constructor() {
    }

    ngOnInit() {

    }
}
