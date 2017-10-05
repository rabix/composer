import {Injectable} from "@angular/core";
import {SystemService} from "./system.service";
import {environment} from './../../environments/environment';

declare var shell:any;
declare var webFrame:any;
if ( ! environment.browser ) {
	const {shell, webFrame} = window["require"]("electron");
}

@Injectable()
export class ElectronSystemService extends SystemService {

    public boot() {
        webFrame.setZoomLevelLimits(1, 1);
    }

    public openLink(url: string, event?: MouseEvent) {
        if (event) {
            event.preventDefault();
        }
        shell.openExternal(url);
    }
}