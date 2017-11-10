const fs = require("fs-extra");
const path = require("path");
const tar = require("tar");
const glob = require("glob");
const requiredExecutorVersion = require("../package").executorVersion;
const request = require("request");
const rimraf = require("rimraf");
const child = require("child_process");

console.log("Bundling Rabix Executor", requiredExecutorVersion);
const targetDir = path.resolve(__dirname + "/../electron/executor");

try {
    const test = child.execSync("java -jar " + targetDir + "/lib/rabix-cli.jar --version");
    const output = "v" + test.toString().trim().slice(6);
    if (requiredExecutorVersion === output) {
        console.log("Stopping download, Rabix executor is already bundled.");
        process.exit(0);
    }
} catch (ex) {
    console.log("Preparing to download " + requiredExecutorVersion);
}

rimraf.sync(targetDir);
fs.ensureDirSync(targetDir);

console.log("Checking releases");
request.get({
    url: "https://api.github.com/repos/rabix/bunny/releases",
    json: true,
    headers: {
        "User-Agent": "Rabix Composer"
    }
}, (err, response, releases) => {
    if (err) {
        throw err;
    }

    console.log("Response", response);
    console.log("Releases", releases);

    const release = releases.find(r => r.tag_name === "v" + requiredExecutorVersion);

    if (!release) {
        throw new Error("No matching Rabix Executor Release");
    }

    const releaseURL = release.assets.find(asset => {
        return asset.name.endsWith(".tar.gz")
            && !asset.name.endsWith("-tes.tar.gz");
    }).browser_download_url;


    const tmpDir = targetDir + "/tmp";
    fs.ensureDir(tmpDir);

    console.log("Downloading", releaseURL);

    const write = request.get(releaseURL).pipe(tar.x({
        gzip: true,
        C: tmpDir
    }));

    write.on("close", () => {
        console.log("Copying ...");
        const versionedDir = glob.sync(`${tmpDir}/*`)[0];
        fs.copySync(versionedDir + "/", targetDir);
        rimraf.sync(tmpDir);
    });

});





