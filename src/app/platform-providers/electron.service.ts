import {Injectable} from "@angular/core";
import {PlatformProvider} from "./platform-provider.abstract";

//noinspection TypeScriptUnresolvedFunction
const {shell} = window.require("electron");

@Injectable()
export class ElectronPlatformProviderService extends PlatformProvider {

    public openLink(url: string) {
        console.debug("Should open ", url);
        shell.openExternal(url);
    }
}