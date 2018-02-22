import {Injectable} from "@angular/core";
import * as Electron from "electron";
import {ElectronProxyService} from "../proxy/electron-proxy.service";

type OSType = "Windows" | "Linux" | "MacOS" | "Unix" | string;

@Injectable()
export class NativeSystemService {

    os: OSType;

    constructor(private electron: ElectronProxyService) {
        this.os = this.detectOS();
    }

    private detectOS(): OSType {

        const appVersion = navigator.appVersion;
        if (~appVersion.indexOf("Win")) {
            return "Windows";
        } else if (~appVersion.indexOf("Mac")) {
            return "MacOS";
        } else if (~appVersion.indexOf("X11")) {
            return "Unix";
        } else if (~appVersion.indexOf("Linux")) {
            return "Linux";
        }
    }

    isOS(os: OSType): boolean {
        return this.os === os;
    }

    private openDialog(options: Electron.OpenDialogOptions = {}): Promise<string[]> {
        const {app, dialog, getCurrentWindow} = this.electron.getRemote();

        const config = Object.assign({
            defaultPath: app.getPath("home"),
        }, options);

        return new Promise((resolve, reject) => {
            dialog.showOpenDialog(getCurrentWindow(), config, paths => {
                paths ? resolve(paths) : reject();
            });
        });
    }

    openFolderChoiceDialog(options: Electron.OpenDialogOptions = {}, multi = false): Promise<string[]> {

        const title      = "Choose a Directory";
        const properties = ["openDirectory", multi && "multiSelections"].filter(v => v);

        return this.openDialog(Object.assign({title, properties}, options));
    }

    openFileChoiceDialog(options: Electron.OpenDialogOptions = {}): Promise<string[]> {

        const title      = "Choose a File";
        const properties = ["openFile"];

        return this.openDialog(Object.assign({title, properties}, options));
    }

    createFileChoiceDialog(options: Electron.SaveDialogOptions = {}): Promise<string> {
        const {app, dialog, getCurrentWindow} = this.electron.getRemote();

        const config = Object.assign({
            title: "Choose a File",
            defaultPath: app.getPath("home")
        } as Electron.SaveDialogOptions, options);

        return new Promise((resolve, reject) => {
            dialog.showSaveDialog(getCurrentWindow(), config, path => {
                path ? resolve(path) : reject();
            });
        });
    }

    exploreFolder(path: string): void {
        const remote = this.electron.getRemote();
        remote.require("./src/utils/file-explorer-opener").open(path);
    }

}
