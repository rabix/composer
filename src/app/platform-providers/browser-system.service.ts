import {Injectable} from "@angular/core";
import {SystemService} from "./system.service";

@Injectable()
export class BrowserSystemService extends SystemService {

    boot(): void {
    }

    openLink(url: string, event?: MouseEvent) {
        const win = window.open(url, "_blank");
        win.focus();
    }


}
