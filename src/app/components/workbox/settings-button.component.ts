import {Component} from "@angular/core";
import {SettingsService} from "../../services/settings/settings.service";
import {WorkboxService} from "./workbox.service";
import {Observable} from "rxjs";

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

    public hasWarning = false;

    constructor(private workbox: WorkboxService,
                settings: SettingsService) {
        settings.validity.subscribe(isValid => this.hasWarning = !isValid);
    }

    private openSettings() {

        this.workbox.openTab({
            id: "settings",
            title: Observable.of("Settings"),
            contentType: Observable.of("Settings"),
            contentData: {}
        });
    }
}
