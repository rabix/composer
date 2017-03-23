"use strict";
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const yaml = require("js-yaml");
const mkdirp = require("mkdirp");
function findCWLClass(content) {
    try {
        const cwlClasses = ["Workflow", "CommandLineTool"];
        const found = yaml.safeLoad(content, { json: true })["class"] || "";
        return cwlClasses.indexOf(found) !== -1 ? found : "";
    }
    catch (err) {
        return "";
    }
}
function getPotentialCWLClassFromFile(filePath, callback) {
    if (["json", "yaml", "yml", "cwl"].indexOf(filePath.split(".").pop()) === -1) {
        return callback(null, "");
    }
    fs.readFile(filePath, "utf8", (err, raw) => {
        if (err)
            return callback(err);
        callback(null, findCWLClass(raw));
    });
}
function getFileOutputInfo(filePath, callback) {
    fs.lstat(filePath, (err, stats) => {
        if (err)
            return callback(err);
        getPotentialCWLClassFromFile(filePath, (err, cwlClass) => {
            if (err)
                return callback(err);
            let isReadable = true;
            let isWritable = true;
            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err)
                    isReadable = false;
                fs.access(filePath, fs.constants.W_OK, (err) => {
                    if (err)
                        isWritable = false;
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
module.exports = {
    saveFileContent: (path, content, callback) => {
        // Make content optional with an empty string as a default
        if (typeof content === "function") {
            callback = content;
            content = "";
        }
        // Open file for writing. Fails if file doesn't exist
        fs.writeFile(path, content, { flag: "w" }, (err) => {
            if (err)
                return callback(err);
            // If we've written successfully to the file, return the info object
            getFileOutputInfo(path, (err, info) => {
                if (err)
                    return callback(err);
                callback(null, info);
            });
        });
    },
    createFile: (path, content, callback) => {
        // Make content optional with an empty string as a default
        if (typeof content === "function") {
            callback = content;
            content = "";
        }
        // "wx" creates the file if it doesn't exist, but fails if it exists.
        fs.open(path, "wx", (err, fd) => {
            if (err)
                return callback(err);
            // Write the given content to the newly created file
            fs.writeFile(fd, content, (err) => {
                if (err)
                    return callback(err);
                // Provide the same info as the directory listing
                getFileOutputInfo(path, (err, info) => {
                    if (err)
                        return callback(err);
                    callback(null, info);
                });
            });
        });
    },
    readFileContent: (path, callback) => {
        fs.readFile(path, "utf8", (err, raw) => {
            if (err)
                return callback(err);
            callback(null, raw);
        });
    },
    /**
     * @param dir Absolute path of the directory to list
     * @param callback
     */
    readDirectory: (dir, callback) => {
        fs.readdir(dir, (err, listing) => {
            if (err)
                return callback(err);
            const statPromises = listing
                .filter(name => name.charAt(0) !== ".")
                .map(name => new Promise((resolve, reject) => {
                getFileOutputInfo(dir + "/" + name, (err, info) => {
                    if (err)
                        return reject(err);
                    return resolve(info);
                });
            }));
            Promise.all(statPromises).then(resolution => callback(null, resolution), rejection => callback(rejection));
        });
    },
    deletePath: (path, callback) => {
        rimraf(path, {
            disableFlob: true
        }, (err) => {
            if (err)
                return callback(err);
            callback(null);
        });
    },
    createDirectory: (path, callback) => {
        mkdirp(path, (err, made) => {
            if (err)
                return callback(err);
            if (made === null) {
                return callback(new Error(`Folder already exists: ${path}`));
            }
            getFileOutputInfo(path, (err, info) => {
                if (err)
                    return callback(err);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnMuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9mcy5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFNLEVBQUUsR0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0IsTUFBTSxJQUFJLEdBQUssT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNqQyxNQUFNLElBQUksR0FBSyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWpDLHNCQUFzQixPQUFPO0lBQ3pCLElBQUksQ0FBQztRQUNELE1BQU0sVUFBVSxHQUFHLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDbkQsTUFBTSxLQUFLLEdBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFdkUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNYLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDZCxDQUFDO0FBRUwsQ0FBQztBQUVELHNDQUFzQyxRQUFRLEVBQUUsUUFBUTtJQUVwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFD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