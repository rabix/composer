const {app, Menu, BrowserWindow} = require("electron");
const router = require("./ipc-router");
const acceleratorProxy = require("./accelerator-proxy");

let win;

function start(config = {}) {

    router.start();

    win = new BrowserWindow({width: 1024, height: 768});

    win.loadURL(config.url);

    if (config.devTools) {
        win.webContents.openDevTools();
    }

    win.on("closed", () => {
        win = undefined
    });


    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: "Application",
            submenu: [
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
                {label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:"},
                {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:"},
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
                        }
                    ]
                },
                {label: "Toggle DevTools", role: "toggledevtools"},
            ]
        }
    ]));
}


module.exports = {
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

        app.on('activate', () => {
            // On macOS it's common to re-create a window in the App when the
            // dock icon is clicked and there are no other windows open.
            if (win === null) {
                start();
            }
        });


    }
};