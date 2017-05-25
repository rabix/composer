import {Injectable, Optional} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

@Injectable()
export class LayoutService {
    public sidebarHidden = false;

    constructor(@Optional() private preferences: UserPreferencesService) {
        if (this.preferences) {
            this.preferences.getSidebarHidden().take(1).subscribe(val => this.sidebarHidden = !val);
        }
    }

    toggleSidebar() {
        this.sidebarHidden = !this.sidebarHidden;
        if (this.preferences) {
            this.preferences.setSidebarHidden(!this.sidebarHidden);
        }
    }
}
