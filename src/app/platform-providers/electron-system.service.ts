import {Injectable} from "@angular/core";
import {SystemService} from "./system.service";

const {shell, webFrame} = window["require"]("electron");

@Injectable()
export class ElectronSystemService extends SystemService {

    public boot() {
        webFrame.setZoomLevelLimits(1, 1);
        webFrame.setVisualZoomLevelLimits(1, 1);
        webFrame.setLayoutZoomLevelLimits(1, 1);
    }

    public openLink(url: string) {
        shell.openExternal(url);
    }
}
