const Rx = require("rxjs");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const {ipcMain} = require("electron");

function filePathToStats(absolutePath) {
    const stat = Rx.Observable.bindNodeCallback(fs.lstat);
    return stat(absolutePath).map(stats => ({
        name: path.basename(absolutePath),
        path: absolutePath,
        isDir: stats.isDirectory(),
        dirname: path.dirname(absolutePath),
        isFile: stats.isFile(),
        isWritable: true,
        id: absolutePath,
        language: absolutePath.split(".").pop(),
    }));
}

function getFileType(absPath) {
    const ext = absPath.split(".").pop();
    const mightBeCWL = ["cwl", "json", "yml", "yaml"].indexOf(ext) !== -1;
    if (!mightBeCWL) {
        return Rx.Observable.of("").toPromise();
    }

    return Rx.Observable
        .bindNodeCallback(fs.readFile)(absPath, "utf8")
        .map(raw => yaml.safeLoad(raw)["class"])
        .catch(err => {
            console.log("Error when loading class", err);
            return Rx.Observable.of("");
        })
        .toPromise()
}

const handlers = {
    saveFileContent: (reply, options) => {
        const {path, content} = options;
        fs.writeFile(path, content, {encoding: "utf8"}, (error, success) => {
            if (error) reply({error});

            reply({success});
        });
    },

    createFile: (reply, options) => {
        const {path, content} = options;

        fs.access(path, fs.F_OK, (error, success) => {
            if (!error) {
                return reply({error: `File already exists: “${path}”.`});
            }

            fs.writeFile(path, content, (error, success) => {
                if (error) {
                    return reply({error});
                }

                filePathToStats(path).subscribe(stats => {
                    getFileType(stats.path).then(type => {
                        reply(Object.assign(stats, {type}));
                    });
                })
            });
        });


    },

    readFileContent: (reply, path) => {
        Rx.Observable.bindNodeCallback(fs.readFile)(path, "utf8").subscribe(raw => {
            reply(raw);
        });
    },

    readDirectory: (reply, dir) => {
        const readDir = Rx.Observable.bindNodeCallback(fs.readdir);

        readDir(dir)
            .flatMap(Rx.Observable.from)
            .filter(name => name.charAt(0) !== ".")
            .flatMap(name => {
                const fullPath = `${dir}/${name}`;
                return filePathToStats(fullPath);
            })
            .reduce((acc, item) => acc.concat(item), [])
            .subscribe(listing => {
                const promises = listing
                    .filter(item => {
                        const ext = item.name.split(".").pop();
                        const mightBeCWL = ["cwl", "json", "yml", "yaml"].indexOf(ext) !== -1;
                        return item.isFile && mightBeCWL;
                    })
                    .map(item => {
                        return Rx.Observable
                            .bindNodeCallback(fs.readFile)(item.path, "utf8")
                            .map(raw => yaml.safeLoad(raw)["class"])
                            .catch(err => {
                                console.log("Error when loading class", err);
                                return Rx.Observable.of("");
                            })
                            .do(cls => item.type = cls)
                            .toPromise()
                    });

                Promise.all(promises).then(_ => {
                    reply(listing);
                }, (reject) => {
                    console.log("Rejected", reject);
                });
            });
    }
};

ipcMain.on("data-request", (event, request) => {

    const handler = handlers[request.message];
    const reply = (data) => event.sender.send("data-reply", {
        id: request.id,
        data
    });
    handler(reply, request.data);
});