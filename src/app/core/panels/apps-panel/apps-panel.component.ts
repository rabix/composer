import {Component} from "@angular/core";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {take} from "rxjs/operators";

@Component({
    selector: "ct-apps-panel",
    template: `
        <ct-tab-selector distribute="equal" [active]="activeTab" (activeChange)="changeTab($event)">
            <ct-tab-selector-entry [tabName]="'myApps'" data-test="my-projects-tab">My Projects</ct-tab-selector-entry>
            <ct-tab-selector-entry [tabName]="'publicApps'" data-test="public-apps-tab">Public Apps</ct-tab-selector-entry>
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
export class AppsPanelComponent extends DirectiveBase {

    constructor(private localRepository: LocalRepositoryService) {
        super();
    }

    activeTab = "myApps";

    changeTab(tab) {
        this.activeTab = tab;
        this.localRepository.setSelectedAppsPanel(tab);
    }

    ngOnInit() {
        this.localRepository.getSelectedAppsPanel().pipe(
            take(1)
        ).subscribeTracked(this, panel => this.activeTab = panel);
    }


}
