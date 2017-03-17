import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";

@Component({
    selector: "ct-apps-panel",
    template: `
        <ct-tab-selector [tabs]="tabs" distribute="equal" [(active)]="activeTab"></ct-tab-selector>

        <div class="panel-container" [hidden]="activeTab !== 'My Apps'">
            <ct-my-apps-panel></ct-my-apps-panel>
        </div>

        <div class="panel-container p-1" [hidden]="activeTab !== 'Public Apps'">
            <ct-search-field [placeholder]="'Search Public Apps...'"></ct-search-field>
        </div>
    `,
    styleUrls: ["./apps-panel.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppsPanelComponent implements OnInit {

    tabs = ["My Apps", "Public Apps"];

    activeTab = "My Apps";

    constructor() {
    }

    ngOnInit() {

    }
}
