import * as acceleratorProxy from "./accelerator-proxy";
import {Log} from "./logger/logger";

const {app, Menu, BrowserWindow} = require("electron");

const isSpectronRun = ~process.argv.indexOf("--spectron");

const defaultUserDataPath = app.getPath("home") + "/.sevenbridges/rabix-composer";

app.setPath("userData", defaultUserDataPath);

if (isSpectronRun) {
    const dirArgName     = "--user-data-dir=";
    const userDataDirArg = process.argv.find(arg => arg.startsWith(dirArgName));

    if (userDataDirArg) {
        const userDir = userDataDirArg.slice(dirArgName.length);
        app.setPath("userData", userDir);
    }
}

const router = require("./ipc-router");

let win;
let splash;

function start(config: { devTools: boolean, url: string }) {
    router.start();

    splash = new BrowserWindow({
        width: 580,
        height: 310,
        frame: false,
        show: false,
        resizable: false,
        closable: true,
    });
    splash.loadURL(`file://${__dirname}/splash/index.html`);
    splash.once("ready-to-show", () => {
        splash.show();
    });

    splash.once("closed", () => {
        splash = undefined;
    });


    win = new BrowserWindow({
        show: false
    });
    win.loadURL(config.url);
    win.once("ready-to-show", () => {
        setTimeout(() => {
            splash.destroy();
            splash = undefined;
            win.maximize();
            win.show();
        }, 300);
    });

    if (config.devTools && !isSpectronRun) {
        win.webContents.openDevTools();
    }

    win.on("closed", () => {
        win = undefined;
    });


    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: "Application",
            submenu: [
                {
                    label: "Check For Updates...",
                    accelerator: "checkForPlatformUpdates",
                    click: (menu, browser) => {
                        acceleratorProxy.pass(menu, browser, "checkForPlatformUpdates");
                    }
                },
                {type: "separator"},
                {label: "About", selector: "orderFrontStandardAboutPanel:"},
                {type: "separator"},
                {
                    label: "Quit",
                    accelerator: "Command+Q",
                    click: () => {
                        app.quit();
                    }
                }
            ]
        }, {
            label: "Edit",
            submenu: [
                {
                    label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:",
                    click: (menu, browser, event) => {
                        acceleratorProxy.pass(menu, browser, event);
                    }
                },
                {
                    label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:",
                    click: (menu, browser, event) => {
                        acceleratorProxy.pass(menu, browser, event);
                    }
                },
                {type: "separator"},
                {label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:"},
                {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
                {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
                {label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:"}
            ]
        }, {
            label: "Window",
            submenu: [
                {
                    label: "Editor Tabs",
                    submenu: [
                        {
                            id: "closeActiveTab",
                            label: "Close Active Tab",
                            accelerator: "CmdOrCtrl+W",
                            click: (menu, browser, event) => {
                                acceleratorProxy.pass(menu, browser, event);
                            }
                        },
                        {
                            id: "moveTabRight",
                            label: "Select the Tab on the Right",
                            accelerator: "CmdOrCtrl+Shift+]",
                            click: (menu, browser, event) => {
                                acceleratorProxy.pass(menu, browser, event);
                            }
                        },
                        {
                            id: "moveTabLeft",
                            label: "Select the Tab on the Left",
                            accelerator: "CmdOrCtrl+Shift+[",
                            click: (menu, browser, event) => {
                                acceleratorProxy.pass(menu, browser, event);
                            }
                        }
                    ]
                },
                {label: "Toggle DevTools", role: "toggledevtools"},
            ]
        }
    ] as any[] /* types are not accurate for menu items */));
}

export = {
    start: (config) => {

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on("ready", () => start(config));

        // Quit when all windows are closed.
        app.on("window-all-closed", () => {

            Log.info("electron: window-all-closed event on " + process.platform);

            // On macOS it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== "darwin") {
                app.quit();
            }

        });

        app.on("activate", () => {
            // On macOS it's common to re-create a window in the App when the
            // dock icon is clicked and there are no other windows open.
            if (win === null) {
                start(config);
            }
        });
    }
}

