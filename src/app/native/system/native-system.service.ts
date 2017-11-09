import {Injectable} from "@angular/core";
import * as Electron from "electron";
import {ElectronProxyService} from "../proxy/electron-proxy.service";

@Injectable()
export class NativeSystemService {

    constructor(private electron: ElectronProxyService) {
    }

    openFolderChoiceDialog(options: Electron.OpenDialogOptions = {}, multi = false): Promise<string[]> {

        const {app, dialog} = this.electron.getRemote();

        const config = Object.assign({
            title: "Choose a Directory",
            defaultPath: app.getPath("home"),
            properties: ["openDirectory", multi ? "multiSelections" : null].filter(v => v)
        }, options);

        return new Promise((resolve, reject) => {
            dialog.showOpenDialog(config, paths => {
                paths ? resolve(paths) : reject();
            });
        });
    }

    openFileChoiceDialog(options: Electron.OpenDialogOptions = {}, multi = false): Promise<string[]> {

        const {app, dialog} = this.electron.getRemote();

        const config = Object.assign({
            title: "Choose a File",
            defaultPath: app.getPath("home"),
        }, options);

        return new Promise((resolve, reject) => {
            dialog.showOpenDialog(config, paths => {
                paths ? resolve(paths) : reject();
            });
        })
    }

    exploreFolder(path: string): void {
        const remote = this.electron.getRemote();
        remote.require("open")(path);
    }

}
