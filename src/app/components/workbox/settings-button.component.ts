import {Component} from "@angular/core";
import {EventHubService} from "../../services/event-hub/event-hub.service";
import {Observable} from "rxjs";
import {OpenTabAction} from "../../action-events";

@Component({
    selector: "ct-settings-button",
    template: `
        <div>
            <button (click)="openSettings()" class="settings-button btn btn-secondary btn-sm">
                <i class="fa fa-bars"></i>
            </button>
        </div>
    `
})
export class SettingsButtonComponent {


    constructor(private eventHub: EventHubService) {

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