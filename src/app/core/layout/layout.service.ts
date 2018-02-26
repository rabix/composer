import {Injectable} from "@angular/core";

@Injectable()
export class LayoutService {
    sidebarHidden = false;

    constructor() {
    }

    toggleSidebar() {
        this.sidebarHidden = !this.sidebarHidden;
    }
}
