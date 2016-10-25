const Rx = require("rxjs");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const {ipcMain} = require("electron");

const handlers = {
    saveFileContent: (reply, options) => {
        const {path, content} = options;
        fs.writeFile(path, content, {encoding: "utf8"}, (error, success) => {
            if (error) reply({error});

            reply({success});
        });

    },

    readFileContent: (reply, path) => {
        Rx.Observable.bindNodeCallback(fs.readFile)(path, "utf8").subscribe(raw => {
            reply(raw);
        });
    },

    readDirectory: (reply, dir) => {
        const readDir = Rx.Observable.bindNodeCallback(fs.readdir);
        const stat = Rx.Observable.bindNodeCallback(fs.lstat);

        readDir(dir)
            .flatMap(Rx.Observable.from)
            .filter(name => name.charAt(0) !== ".")
            .flatMap(name => {
                const path = `${dir}/${name}`;
                return stat(path).map(stats => ({
                    name,
                    path,
                    isDir: stats.isDirectory(),
                    isFile: stats.isFile(),
                    isWritable: true,
                    id: "local_" + path,
                    language: name.split(".").pop(),
                }));
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
                            .map(raw => (yaml.safeLoad(raw)["class"]))
                            .catch(err => {
                                console.log("Caught an error on parsing ", item.path);
                                return Observable.of("");
                            })
                            .do(cls => item.type = cls)
                            .toPromise()
                    });

                Promise.all(promises).then(_ => {
                    reply(listing);
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