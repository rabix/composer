const fs = require("fs-extra");
const path = require("path");
const tar = require("tar");
const glob = require("glob");
const pkg = require("../package");
const request = require("request");
const rimraf = require("rimraf");
const child = require("child_process");

const requiredExecutorVersion = pkg.executorVersion;
const executorDownloadURL = pkg.executorDownloadURL;

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
    console.log("Preparing to download...");
}

rimraf.sync(targetDir);
fs.ensureDirSync(targetDir);

const tmpDir = targetDir + "/tmp";
fs.ensureDir(tmpDir);

console.log("Downloading", executorDownloadURL);

const write = request.get({
    uri: executorDownloadURL,
    gzip: true,
    encoding: null,
}).pipe(tar.x({
    C: tmpDir
}));

write.on("close", () => {
    console.log("Copying ...");
    const versionedDir = glob.sync(`${tmpDir}/*`)[0];
    fs.copySync(versionedDir + "/", targetDir);
    rimraf.sync(tmpDir);
});






