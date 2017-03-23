"use strict";
const platform_gateway_1 = require("./gateways/platform.gateway");
const SearchController = require("./controllers/search.controller");
const fsController = require("./controllers/fs.controller");
const acceleratorController = require("./controllers/accelerator.controller");
const resolver = require("./schema-salad-resolver");
const settings = require("electron-settings");
const searchController = require("./controllers/search.controller");
module.exports = {
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
    hasDataCache: (data, callback) => {
        settings.has("dataCache").then(yeah => {
            callback(null, yeah);
        }, err => {
            callback(err);
        });
    },
    resolve: (path, callback) => {
        resolver.resolve(path).then(result => {
            callback(null, result);
        }, err => {
            callback(err);
        });
    },
    resolveContent: (data, callback) => {
        resolver.res;
        olveContent(data.content, data.path).then(result => {
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
    searchLocalProjects: (data, callback) => {
        SearchController.searchLocalProjects(data.term, data.limit, callback);
    },
    searchUserProjects: (data, callback) => {
        SearchController.searchUserProjects(data.term, data.limit, callback);
    },
    searchPublicApps: (data, callback) => {
        SearchController.searchPublicApps(data.term, data.limit, callback);
    },
    scanPlatforms: (data, callback) => {
        const { credentials } = data;
        const promises = credentials.map(source => {
            return new Promise((resolve, reject) => {
                const platform = new platform_gateway_1.PlatformGateway(source.url);
                platform.getSessionID(source.token, (err, message) => {
                    if (err) {
                        return reject(err);
                    }
                    source.sessionID = platform.sessionID;
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
                        settings.set(`dataCache.${source.profile}`, { publicApps, apps, projects }).then(resolve, reject);
                    }, reject);
                });
            });
        });
        Promise.all(promises).then(values => {
            callback(null, values);
        }, err => callback(err));
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JvdXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0VBQTREO0FBQzVELG9FQUFvRTtBQUNwRSxNQUFNLFlBQVksR0FBWSxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUNyRSxNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzlFLE1BQU0sUUFBUSxHQUFnQixPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUNqRSxNQUFNLFFBQVEsR0FBZ0IsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFM0QsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUNwRSxNQUFNLENBQUMsT0FBTyxHQUFXO0lBRXJCLHFCQUFxQjtJQUVyQixlQUFlLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUTtRQUM1QixZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBQ0QsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVE7UUFDdkIsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUNELGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxRQUFRO1FBQzFCLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFDRCxlQUFlLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUTtRQUM1QixZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBQ0QsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVE7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