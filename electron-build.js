#!/usb/bin/env node
const path = require("path");
const builder = require("electron-builder");
const fs = require("fs-extra");

const projectRoot = path.resolve(__dirname + "/");
const ngDistDir = projectRoot + "/ng-dist";
const electronDir = projectRoot + "/electron";
const appDistDir = projectRoot + "/dist";

// Copy ng-dist to dist
console.log("Copying compiled frontend code...");
fs.copySync(ngDistDir, appDistDir);

// Generate package.json for the distribution build
console.log("Generating production package.json file...");
const electronPackage = JSON.parse(fs.readFileSync(electronDir + "/package.json", "utf8"));
const mainPackage = JSON.parse(fs.readFileSync(projectRoot + "/package.json", "utf8"));
const merged = Object.assign(mainPackage, {
    dependencies: electronPackage.dependencies,
    devDependencies: electronPackage.devDependencies,
    main: "main.js"
});
fs.writeFileSync(appDistDir + "/package.json", JSON.stringify(merged, null, 4));

// Copy Electron main.js file to dist
console.log("Copying main.js...");
fs.copySync(electronDir + "/dist/main.prod.js", appDistDir + "/main.js", {
    overwrite: true
});


// Copy compiled electron code to dist
console.log("Copying electron code...");
fs.copySync(electronDir + "/dist/src", appDistDir + "/src", {
    overwrite: true,
    dereference: true
});
fs.copySync(electronDir + "/dist/executor", appDistDir + "/executor", {
    overwrite: true,
    dereference: true
});
fs.copySync(electronDir + "/src/splash", appDistDir + "/src/splash");

// Copy electron node modules
console.log("Copying electron node_modules...");
fs.copySync(electronDir + "/node_modules", appDistDir + "/node_modules", {
    overwrite: true,
    dereference: true
});

console.log("Starting build process...");
builder.build({
    config: {
        appId: "io.rabix.composer",
        productName: "rabix-composer",
        asar: true,
        directories: {
            output: "build",
            app: "dist",
            buildResources: "build-resources"
        },
        mac: {
            target: ["zip", "dir", "dmg"],
        },
        win: {
            target: ["zip", "portable", "dir"],
        },
        linux: {
            target: ["zip", "dir"],
        },

    }

});
