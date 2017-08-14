import {Injectable} from "@angular/core";

@Injectable()
export class LayoutService {
    public sidebarHidden = false;

    constructor() {
    }

    toggleSidebar() {
        this.sidebarHidden = !this.sidebarHidden;
    }
}
