"use strict";
const { app, Menu, BrowserWindow } = require("electron");
app.setPath("userData", app.getPath("home") + "/.sevenbridges/rabix-composer");
const router = require("./ipc-router");
const acceleratorProxy = require("./accelerator-proxy");
const profile = require("./user-profile/profile");
let win;
let splash;
function start(config) {
    router.start();
    profile.boot();
    splash = new BrowserWindow({
        width: 580,
        height: 310,
        frame: false,
        show: false,
        resizable: false
    });
    splash.loadURL(`file://${__dirname}/splash/index.html`);
    splash.once("ready-to-show", () => {
        splash.show();
    });
    win = new BrowserWindow({
        show: false
    });
    win.maximize();
    win.loadURL(config.url);
    win.once("ready-to-show", () => {
        setTimeout(() => {
            win.show();
            splash.destroy();
            splash = undefined;
        }, 300);
    });
    if (config.devTools) {
        win.webContents.openDevTools();
    }
    win.on("closed", () => {
        win = undefined;
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
        {
            label: "Application",
            submenu: [
                { label: "About", selector: "orderFrontStandardAboutPanel:" },
                { type: "separator" },
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
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
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
                { label: "Toggle DevTools", role: "toggledevtools" },
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
        app.on("activate", () => {
            // On macOS it's common to re-create a window in the App when the
            // dock icon is clicked and there are no other windows open.
            if (win === null) {
                start(config);
            }
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5jb21tb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWFpbi5jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE1BQU0sRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUV2RCxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLCtCQUErQixDQUFDLENBQUM7QUFFL0UsTUFBTSxNQUFNLEdBQWEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFFeEQsa0RBQW1EO0FBRW5ELElBQUksR0FBRyxDQUFDO0FBQ1IsSUFBSSxNQUFNLENBQUM7QUFFWCxlQUFlLE1BQTBDO0lBRXJELE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNmLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUVmLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQztRQUN2QixLQUFLLEVBQUUsR0FBRztRQUNWLE1BQU0sRUFBRSxHQUFHO1FBQ1gsS0FBSyxFQUFFLEtBQUs7UUFDWixJQUFJLEVBQUUsS0FBSztRQUNYLFNBQVMsRUFBRSxLQUFLO0tBQ25CLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLG9CQUFvQixDQUFDLENBQUM7SUFDeEQsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7UUFDekIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxHQUFHLElBQUksYUFBYSxDQUFDO1FBQ3BCLElBQUksRUFBRSxLQUFLO0tBQ2QsQ0FBQyxDQUFDO0lBQ0gsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2YsR0FBRyxD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