import * as mock from "mock-require";
import * as acceleratorProxy from "./accelerator-proxy";

const {app, Menu, BrowserWindow} = require("electron");

const isSpectronRun       = ~process.argv.indexOf("--spectron");
const defaultUserDataPath = app.getPath("home") + "/.sevenbridges/rabix-composer";

app.setPath("userData", defaultUserDataPath);

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

applyCLIArgs();

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


/**
 * If we are running functional tests with spectron, we need to expose more of the app to
 * outside control.
 *
 * First, we need to be able to override the directory in Chromium will be storing data.
 * This is “--user-data-dir”. We need it so tests will not store data in the same folder where the
 * regular apps stores it, and tests should not share data amongst themselves, so each test case
 * will provide a different directory, and clean it up afterwards.
 *
 * We also need a possibility to override some modules in the app.
 * For example, we don't want to do actual HTTP requests. We instead need a way to mock
 * modules on per-test basis.
 *
 */
function applyCLIArgs() {
    const dirArgName             = "--user-data-dir=";
    const moduleOverridesArgName = "--override-modules=";

    // Find if arguments are present in the command line
    const userDataDirArg     = process.argv.find(arg => arg.startsWith(dirArgName));
    const moduleOverridesArg = process.argv.find(arg => arg.startsWith(moduleOverridesArgName))

    // If we're given an alternate userData directory, override the default one
    if (userDataDirArg) {
        const userDir = userDataDirArg.slice(dirArgName.length);
        app.setPath("userData", userDir);
    }

    // If we're given module overrides, we're given a string through the command line
    // so we need to unpack it
    if (moduleOverridesArg) {
        // Take the argument value
        const serializedOverrides = moduleOverridesArg.slice(moduleOverridesArgName.length);

        // Deserialize it in such way that everything that is not an object goes through eval
        // We serialized function as strings beforehand, so we need to bring them back to life
        const overrides: { module: string, override: Object }[] = JSON.parse(serializedOverrides, (key, val) => {
            if (typeof val === "string" && (val.startsWith("(") || val.startsWith("function"))) {
                return eval(`(${val})`);
            }

            return val;
        }) || [];

        // For all modules that should be mocked, provide given mocks to the module loader now,
        // before anybody else requires them.
        // That way, they will get mocks from cache.
        overrides.forEach(override => {
            mock(override.module, override.override);
        });
    }
}
