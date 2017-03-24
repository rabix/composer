const fs     = require("fs");
const async  = require("async");
const path   = require("path");
const util   = require("util");
const events = require("events");

const EventEmitter = events.EventEmitter;

export class finder extends EventEmitter {

    private stopSignal = false;

    constructor(options: { rootFolders: string[]; filterFunction: (strPath: string, fsStat: fs.Stats) => void; });
    constructor(public options: any) {
        super();
    }

    startSearch() {
        this.stopSignal = false;
        var that        = this;

        const promises = that.options.rootFolders.map(folder => new Promise((resolve, reject) => {

            this.recurseFolder(folder, function (err) {
                if (err) {
                    that.emit("error", err);
                    that.stopSignal = true;
                    reject(err);
                    return;
                }

                resolve(null)
            });
        }));

        return Promise.all(promises).then(results => {
            that.emit("complete");
        }, err => {
            that.emit("error", err);
        })


    }

    stopSearch() {
        this.stopSignal = true;
    }

    recurseFolder(strFolderName: string, folderCompleteCallback: (err: Error) => void) {
        var that = this;

        if (this.stopSignal) {
            folderCompleteCallback(null);
            return;
        }

        fs.readdir(strFolderName, function (err, files) {
            if (err) {
                pathError(err, strFolderName);
                return folderCompleteCallback(err);
            }
            if (!files) {
                return folderCompleteCallback(null); // This is just an empty folder

            }

            async.each(files,
                function (file: String, callback: Function) {
                    if (that.stopSignal) {
                        return callback(null);
                    }
                    try {
                        var strPath: string = path.join(strFolderName, file);

                    }
                    catch (e) {
                        pathError(e, strPath);
                        return callback(null); // Don't return error to callback or we will miss other files in directory
                    }
                    fs.lstat(strPath, function (err, stat) {
                        if (that.stopSignal) {
                            return callback(null);
                        }
                        if (err) {
                            pathError(err, strPath);
                            return callback(null); // Don't return error to callback or we will miss other files in directory
                        }
                        if (!stat) {
                            pathError(new Error("Could not get stat for file " + strPath), strPath);
                            return callback(null); // Don't return error to callback or we will miss other files in directory
                        }
                        if (stat.isDirectory()) {
                            checkMatch(strPath, stat);
                            that.recurseFolder(strPath, function (err) {
                                if (err) {
                                    pathError(err, strPath);
                                }
                                return callback(null);
                            });
                        } else {
                            checkMatch(strPath, stat);

                            return callback(null);


                        }

                    })
                },
                function onComplete(err) {
                    if (err) {
                        pathError(err, strFolderName);
                    }
                    return folderCompleteCallback(err);
                }
            )

        })

        function pathError(err, strPath) {
            try {
                that.emit("patherror", err, strPath);
            } catch (e) {
                //Already emitted a path error and the handler failed must not throw error or other files will fail to process too
                that.emit("error", new Error("Error in path Error Handler" + e));
            }

        }

        function checkMatch(strPath, stat) {

            try {
                const relevance = that.options.filterFunction(strPath, stat);
                if (relevance) {
                    that.emit("match", strPath, stat, relevance);
                }

            }
            catch (e) {
                pathError(e, strPath);
            }
        }
    }
}
(module).exports = finder;
