import {Injectable} from "@angular/core";
import "rxjs/add/operator/take";

@Injectable()
export class LayoutService {
    public sidebarHidden = false;

    constructor() {
    }

    toggleSidebar() {
        this.sidebarHidden = !this.sidebarHidden;
    }
}
