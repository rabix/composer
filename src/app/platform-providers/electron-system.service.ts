import {Injectable} from "@angular/core";
import {SystemService} from "./system.service";

const {shell, webFrame} = window["require"]("electron");

@Injectable()
export class ElectronSystemService extends SystemService {

    boot() {
        webFrame.setZoomLevelLimits(1, 1);
    }

    openLink(url: string, event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        shell.openExternal(url);
    }
}
