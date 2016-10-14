import {Injectable} from "@angular/core";
import {PlatformProvider} from "./platform-provider.abstract";

const {shell} = window.require("electron");

@Injectable()
export class ElectronPlatformProviderService extends PlatformProvider {

    public openLink(url: string) {
        shell.openExternal(url);
    }
}