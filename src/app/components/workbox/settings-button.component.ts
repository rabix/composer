import {Component} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {Observable} from "rxjs";
import {OpenTabAction} from "../../action-events";
import {SettingsService} from "../../services/settings/settings.service";

@Component({
    selector: "ct-settings-button",
    template: `
        <div>
            <button (click)="openSettings()" class="settings-button btn btn-secondary btn-sm">
                <i *ngIf="!hasWarning" class="fa fa-fw fa-cog"></i>
                <i *ngIf="hasWarning" class="fa fa-fw fa-exclamation-triangle text-warning"></i>
            </button>
        </div>
    `
})
export class SettingsButtonComponent {

    private hasWarning = false;

    constructor(private eventHub: EventHubService, settings: SettingsService) {
        settings.validity.subscribe(isValid => this.hasWarning = !isValid);
    }

    private openSettings() {

        this.eventHub.publish(new OpenTabAction({
            id: "settings",
            title: Observable.of("Settings"),
            contentType: Observable.of("Settings"),
            contentData: {}
        }));
    }
}