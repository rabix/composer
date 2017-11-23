const path = require("path");
const builder = require("electron-builder");
const fs = require("fs-extra");
const archiver = require("archiver");
const glob = require("glob");


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
fs.copySync(electronDir + "/executor", appDistDir + "/executor", {
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
        asarUnpack: ["executor/**"],
        directories: {
            output: "build",
            app: "dist",
            buildResources: "build-resources"
        },
        protocols: [{
            "name": "rabix-composer",
            "role": "Editor",
            "schemes": ["rabix-composer"]
        }],
        mac: {
            target: ["dmg"],
        },
        win: {
            target: ["nsis"],
        },
        linux: {
            target: ["AppImage"],
        },
        nsis: {
            oneClick: false,
            perMachine: true,
            allowElevation: true,
            allowToChangeInstallationDirectory: true
        },
        fileAssociations: [{
            ext: "cwl",
            name: "CWL"
        }]

    }
}).then((data) => {

    console.log("Build completed", data);
    /**
     * For Windows, we can't take a single-file artifact because of missing libraries.
     * We need to pack the installer with other stuff that come with the build (.dll libs)
     */
    console.log("Platform: " + process.platform);

    if (process.platform !== "win32") {
        return data;
    }


    console.log("Archiving Windows installer...");
    const [installerFilepath] = glob.sync("*.exe", {cwd: "build"});

    if (!installerFilepath) {
        throw new Error("Cannot find installer binary.");
    }

    const zipPath = "build/" + installerFilepath.slice(0, -3) + "zip";
    const buildInfoPath = "latest.yml";
    const unpackedDir = "win-unpacked";

    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");

    output.on("close", () => {
        console.log("Archived " + archive.pointer() + " bytes");
    });

    archive.on("error", err => {
        throw err;
    });

    archive.pipe(output);

    archive.file(`build/${installerFilepath}`, {name: installerFilepath});
    archive.file(`build/${buildInfoPath}`, {name: buildInfoPath});
    archive.directory(`build/${unpackedDir}`, {name: unpackedDir});
    return archive.finalize();

});

console.log("Started building.");

