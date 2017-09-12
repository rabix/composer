import {Inject, Injectable, InjectionToken, Optional} from "@angular/core";
import * as Electron from "electron";

export const TOKEN_WINDOW = new InjectionToken<Window>("token.window");

@Injectable()
export class ElectronProxyService {

    private window: Window = window;

    constructor(@Inject(TOKEN_WINDOW)
                @Optional() $window: Window) {
        if ($window) {
            this.window = $window;
        }
    }

    getRemote(): Electron.Remote {
        return this.window["require"]("electron").remote;
    }
}
