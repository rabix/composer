import {Injectable} from "@angular/core";
import {PlatformProvider} from "./platform-provider.abstract";

@Injectable()
export class BrowserPlatformProviderService implements PlatformProvider {


    public openLink(url: string) {
        const win = window.open(url, "_blank");
        win.focus();
    }
}