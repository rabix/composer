const fs     = require("fs-extra");
const path   = require("path");
const rimraf = require("rimraf");
const yaml   = require("js-yaml");
const mkdirp = require("mkdirp");

function findCWLClass(content) {
    try {
        const cwlClasses = ["Workflow", "CommandLineTool"];
        const found      = yaml.safeLoad(content, {json: true})["class"] || "";

        return cwlClasses.indexOf(found) !== -1 ? found : "";
    } catch (err) {
        return "";
    }

}

function getPotentialCWLClassFromFile(filePath, callback) {

    if (["json", "yaml", "yml", "cwl"].indexOf(filePath.split(".").pop()) === -1) {
        return callback(null, "");
    }

    fs.readFile(filePath, "utf8", (err, raw) => {
        if (err) return callback(err);

        callback(null, findCWLClass(raw));
    });
}

function getFileOutputInfo(filePath, callback) {

    fs.lstat(filePath, (err, stats) => {
        if (err) return callback(err);

        getPotentialCWLClassFromFile(filePath, (err, cwlClass) => {
            if (err) return callback(err);

            let isReadable = true;
            let isWritable = true;

            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) isReadable = false;

                fs.access(filePath, fs.constants.W_OK, (err) => {
                    if (err) isWritable = false;

                    callback(null, {
                        type: cwlClass,
                        path: filePath,
                        name: path.basename(filePath),
                        isDir: stats.isDirectory(),
                        isFile: stats.isFile(),
                        dirname: path.dirname(filePath),
                        language: stats.isFile() ? filePath.split(".").pop() : "",
                        isWritable,
                        isReadable
                    });
                });
            });

        });


    });
}

export = {
    saveFileContent: (path, content, callback) => {

        // Make content optional with an empty string as a default
        if (typeof content === "function") {
            callback = content;
            content  = "";
        }

        // Open file for writing. Fails if file doesn't exist
        fs.writeFile(path, content, {flag: "w"}, (err) => {
            if (err) return callback(err);

            // If we've written successfully to the file, return the info object
            getFileOutputInfo(path, (err, info) => {
                if (err) return callback(err);

                callback(null, info);
            });
        });

    },

    createFile: (path, content, callback) => {

        // Make content optional with an empty string as a default
        if (typeof content === "function") {
            callback = content;
            content  = "";
        }

        // "wx" creates the file if it doesn't exist, but fails if it exists.
        fs.open(path, "wx", (err, fd) => {
            if (err) return callback(err);

            // Write the given content to the newly created file
            fs.writeFile(fd, content, (err) => {
                if (err) return callback(err);

                // Provide the same info as the directory listing
                getFileOutputInfo(path, (err, info) => {
                    if (err) return callback(err);

                    callback(null, info);
                });
            });
        });
    },

    readFileContent: (path, callback) => {

        fs.readFile(path, "utf8", (err, raw) => {
            if (err) return callback(err);

            callback(null, raw);
        });
    },

    /**
     * @param dir Absolute path of the directory to list
     * @param callback
     */
    readDirectory: (dir, callback) => {

        fs.readdir(dir, (err, listing) => {
            if (err) return callback(err);

            const statPromises = listing

            // Take away dot-files and directories, we won't list those
                .filter(name => name.charAt(0) !== ".")

                // Map them onto promises that will return the output info for each entry
                .map(name => new Promise((resolve, reject) => {

                    getFileOutputInfo(dir + path.sep + name, (err, info) => {
                        if (err) return reject(err);

                        return resolve(info)
                    });

                }));

            Promise.all(statPromises).then(
                resolution => callback(null, resolution),
                rejection => callback(rejection)
            );
        });
    },

    deletePath: (path, callback) => {
        rimraf(path, {
            disableFlob: true
        }, (err) => {
            if (err) return callback(err);

            callback(null);
        })
    },

    createDirectory: (path, callback) => {

        mkdirp(path, (err, made) => {
            if (err) return callback(err);

            if (made === null) {
                return callback(new Error(`Folder already exists: ${path}`));
            }

            getFileOutputInfo(path, (err, info) => {
                if (err) return callback(err);

                callback(null, info);
            });
        });
    },

    pathExists: (path, callback) => {
        fs.access(path, fs.constants.F_OK, (err) => {
            callback(null, {
                exists: err ? false : true
            });
        });
    },
    findCWLClass,
    getPotentialCWLClassFromFile,
    getFileOutputInfo
};
