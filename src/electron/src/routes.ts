import {PlatformGateway} from "./gateways/platform.gateway";
import * as SearchController from "./controllers/search.controller";
const fsController          = require("./controllers/fs.controller");
const acceleratorController = require("./controllers/accelerator.controller");
const resolver              = require("./schema-salad-resolver");
const settings              = require("electron-settings");

const searchController = require("./controllers/search.controller");
module.exports         = {

    // File System Routes

    saveFileContent: (data, callback) => {
        fsController.saveFileContent(data.path, data.content, callback);
    },
    createFile: (data, callback) => {
        fsController.createFile(data.path, data.content, callback);
    },
    readDirectory: (path, callback) => {
        fsController.readDirectory(path, callback);
    },
    readFileContent: (path, callback) => {
        fsController.readFileContent(path, callback);
    },
    deletePath: (path, callback) => {
        fsController.deletePath(path, callback);
    },
    createDirectory: (path, callback) => {
        fsController.createDirectory(path, callback);
    },
    pathExists: (path, callback) => {
        fsController.pathExists(path, callback);
    },

    resolve: (path, callback) => {
        resolver.resolve(path).then(result => {
            callback(null, result);
        }, err => {
            callback(err);
        });
    },

    resolveContent: (data, callback) => {
        resolver.resolveContent(data.content, data.path).then(result => {
            callback(null, result);
        }, err => {
            callback(err);
        });
    },

    // Shortcut Routes
    accelerator: (name, callback) => {
        acceleratorController.register(name, callback);
    },

    getSetting: (key, callback) => {
        settings.get(key).then(result => {
            callback(null, result);
        }, err => {
            callback(err);
        });
    },

    putSetting: (data, callback) => {
        settings.set(data.key, data.value).then(result => {
            callback(null, result);
        }, err => {
            callback(err);
        });
    },

    searchLocalProjects: (data: { term: string, limit: number }, callback) => {
        SearchController.searchLocalProjects(data.term, data.limit, callback);
    },

    searchUserProjects: (data: { term: string, limit: number }, callback) => {
        SearchController.searchUserProjects(data.term, data.limit, callback);
    },

    searchPublicApps: (data: { term: string, limit: number }, callback) => {
        SearchController.searchPublicApps(data.term, data.limit, callback);
    },

    scanPlatforms: (data, callback) => {

        console.log("Triggered platform scanning");

        settings.get("credentials").then(results => {

            const promises = results.map(source => {

                return new Promise((resolve, reject) => {

                    const platform = new PlatformGateway(source.url);

                    platform.getSessionID(source.token, (err, message) => {
                        if (err) {
                            return reject(err);
                        }

                        source.sessionID = platform.sessionID;
                        settings.set("credentials", results);

                        const publicProm = new Promise((resolve, reject) => {
                            platform.getPublicApps((err, apps) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(apps);
                            });
                        });

                        const userProm = new Promise((resolve, reject) => {
                            platform.getUserApps((err, apps) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(apps);
                            });
                        });

                        const projectProm = new Promise((resolve, reject) => {
                            platform.getProjects((err, projects) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(projects);
                            });
                        });

                        Promise.all([publicProm, userProm, projectProm]).then(values => {
                            const [publicApps, apps, projects] = values;

                            settings.set(`dataCache.${source.profile}`, {publicApps, apps, projects}).then(resolve, reject);

                        }, reject);
                    });

                });
            });

            Promise.all(promises).then(values => {
                callback(null, values);
            }, err => callback(err));

        }, err => {
            callback(err);
        });
    }

};
