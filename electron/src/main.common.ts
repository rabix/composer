import * as mock from "mock-require";
import * as acceleratorProxy from "./accelerator-proxy";
import * as openExternalFileProxy from "./open-external-file-proxy";
import * as path from "path";

const {app, Menu, BrowserWindow} = require("electron");
const deepLinkingController = require("./controllers/open-external-file/deep-linking-protocol-controller");
const localFileController = require("./controllers/open-external-file/open-file-handler-controller");

const isSpectronRun = ~process.argv.indexOf("--spectron");
const defaultUserDataPath = app.getPath("home") + path.sep + ".sevenbridges/rabix-composer";

app.setPath("userData", defaultUserDataPath);

process.on("unhandledRejection", (reason, p) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
});

applyCLIArgs();

const router = require("./ipc-router");

let win = null;
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
        win = null;
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
                {
                    label: "About",
                    accelerator: "showAboutPageModal",
                    click: (menu, browser) => {
                        acceleratorProxy.pass(menu, browser, "showAboutPageModal");
                    }
                },
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

        // Protocol handler for darwin
        app.setAsDefaultProtocolClient("rabix-composer");
        app.on("open-url", function (event, url) {
            openExternalFiles(url);
            focusMainWindow();
        });

        // File handler for darwin
        app.on("open-file", function (event, filePath) {
            openExternalFiles(filePath);
            focusMainWindow();
        });

        // Initial File handler for win32
        if (process.platform === "win32") {
            openExternalFiles(...getFilePathsFromArgs(process.argv.slice(1)));
        }

        // File/Protocol handler for win32
        const shouldQuit = app.makeSingleInstance((argv) => {
            // Someone tried to run a second instance, we should focus our window.

            // Protocol handler for win32
            // argv: An array of the second instance’s (command line / deep linked) arguments
            if (process.platform === "win32") {
                // Keep only command line / deep linked arguments
                openExternalFiles(...getFilePathsFromArgs(argv.slice(1)));
            }

            focusMainWindow();
        });

        if (shouldQuit) {
            app.quit();
            return
        }

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on("ready", () => start(config));

        // Quit when all windows are closed.
        app.on("window-all-closed", () => {

            // On macOS it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            // if (process.platform !== "darwin") {
            //     app.quit();
            // }

            app.quit();

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
 * Open external files (using deep linking or file protocol)
 */
function openExternalFiles(...items: string[]) {
    items.forEach((item) => {
        if (item.startsWith("rabix-composer://")) {
            const encoded = item.replace("rabix-composer://", "");
            const data = deepLinkingController.setMagnetLinkData(encoded);
            openExternalFileProxy.passMagnetLink(data);
        } else {
            const filePath = localFileController.setLocalFilePath(item);
            openExternalFileProxy.passFilePath(filePath);
        }
    });
}

/**
 * Filter command line arguments to get file paths
 */
function getFilePathsFromArgs(args: string []) {
    // If dev mode do not use first argument as a file path
    const devMode = process.argv.find(arg => arg.startsWith("--dev-mode"));

    return args.filter((arg, index) => !(arg.startsWith("-") || (devMode && index === 0)));
}


/**
 * Focus main window
 */
function focusMainWindow() {
    if (win) {
        if (win.isMinimized()) {
            win.restore()
        }
        win.focus()
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
    const moduleOverridesArg = process.argv.find(arg => arg.startsWith(moduleOverridesArgName));

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
