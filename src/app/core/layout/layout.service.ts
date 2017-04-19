import {Injectable} from "@angular/core";

@Injectable()
export class LayoutService {
    sidebarExpanded: boolean = true;

    toggleSidebar() {
        this.sidebarExpanded = !this.sidebarExpanded;
    }
}
