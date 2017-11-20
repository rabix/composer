const fs = require("fs-extra");
fs.copySync("electron/src/splash", "electron/dist/src/splash", {
    overwrite: true,
    recursive: true,
});
