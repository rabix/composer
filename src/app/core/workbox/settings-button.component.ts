import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {SettingsService} from "../../services/settings/settings.service";
import {WorkboxService} from "./workbox.service";

@Component({

    selector: "ct-settings-button",
    styles: [`
        .settings-icon {
            display: inline-block;
            font-size: 1rem;
        }
    `],
    template: `
        <i (click)="openSettings()" class="settings-icon clickable fa fa-fw fa-sliders" [class.text-warning]="hasWarning"></i>
    `
})
export class SettingsButtonComponent {

    public hasWarning = false;

    constructor(private workbox: WorkboxService,
                settings: SettingsService) {
        settings.validity.subscribe(isValid => this.hasWarning = !isValid);
    }

    openSettings() {

        this.workbox.openTab({
            id: "?settings",
            label: "Settings",
            type: "Settings",
        });
    }
}
