import {RequestCallback} from "request";
import {PublicAPI} from "./controllers/public-api.controller";
import * as SearchController from "./controllers/search.controller";
import {SwapController} from "./controllers/swap.controller";
import {AppQueryParams} from "./sbg-api-client/interfaces/queries";
import {SBGClient} from "./sbg-api-client/sbg-client";
import {DataRepository} from "./storage/data-repository";
import {CredentialsCache, LocalRepository} from "./storage/types/local-repository";
import {UserRepository} from "./storage/types/user-repository";

const swapPath       = require("electron").app.getPath("userData") + "/swap";
const swapController = new SwapController(swapPath);

const fsController          = require("./controllers/fs.controller");
const acceleratorController = require("./controllers/accelerator.controller");
const resolver              = require("./schema-salad-resolver");
const md5                   = require("md5");

const repository     = new DataRepository();
const repositoryLoad = new Promise((resolve, reject) => repository.load((err) => err ? reject(err) : resolve(1))).catch(err => {
    console.log("Caught promise rejection", err);
    // return err;
});

const platformFetchingLocks: { [platformID: string]: Promise<any> } = {};

const ensurePlatformUser = () => {
    return repositoryLoad.then(() => {
        const credentials    = repository.local.activeCredentials;
        const userRepository = repository.user;

        if (!credentials || !userRepository) {
            throw new Error("You are not connected to any platform.");
        }

        return repository;
    });
};

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

    resolve: (path, callback: (err?: Error, result?: Object) => void) => {
        resolver.resolve(path).then(result => {
            callback(null, result);
        }, err => {
            callback(err);
        });
    },

    getUserByToken: (data: { url, token }, callback: RequestCallback) => {
        const api = new PublicAPI(data.url, data.token);
        api.getUser(callback);
    },

    resolveContent: (data, callback) => {
        resolver.resolveContent(data.content, data.path).then(result => {
            callback(null, result);
        }, err => callback(err));
    },

    // Shortcut Routes
    accelerator: (name, callback) => {
        acceleratorController.register(name, callback);
    },

    searchLocalProjects: (data: { term: string, limit: number, folders: string[] }, callback) => {
        repositoryLoad.then(() => {

            const localFolders = repository.local.localFolders;
            SearchController.searchLocalProjects(localFolders, data.term, data.limit, callback);

        }).catch(callback);
    },


    getProjects: (data: { url: string; token: string }, callback) => {
        SBGClient.create(data.url, data.token).projects.all().then(response => {
            callback(null, response.filter(project => project.type === "v2"));
        }, rejection => callback(rejection));
    },

    getApps: (data: { url: string, token: string, query?: AppQueryParams }, callback) => {
        SBGClient.create(data.url, data.token).apps.private(data.query || {})
            .then(
                response => callback(null, response),
                reject => callback(reject)
            );
    },

    getLocalRepository: (data: { key?: string } = {}, callback) => {

        repositoryLoad.then((repoData) => {
            const repositoryData = data.key ? repository.local[data.key] : repository.local;

            callback(null, repositoryData);
        }, err => {
            callback(err)
        });
    },

    watchLocalRepository: (data: { key: string }, callback) => {

        repositoryLoad.then((repoData) => {

            if (repository.local && repository.local.hasOwnProperty(data.key)) {
                callback(null, repository.local[data.key]);

                repository.on(`update.local.${data.key}`, (value) => {
                    callback(null, value);
                });
            } else {
                const keyList = Object.keys(repository.local).map(k => `“${k}”`).join(", ");
                callback(new Error(`
                    Key “${data.key}” does not exist in the local storage. 
                    Available keys: ${keyList}
                `));
            }
        }, err => {
            callback(err)
        });
    },


    patchLocalRepository: (patch: Partial<LocalRepository>, callback) => {
        repositoryLoad.then(() => {
            repository.updateLocal(patch, callback);
        }, err => {
            callback(err)
        });
    },

    getUserRepository: (data: { key?: string } = {}, callback) => {
        repositoryLoad.then(() => {
            const repositoryData = data.key ? repository.user[data.key] : repository.user;
            callback(null, repositoryData);
        }, err => callback(err));
    },

    watchUserRepository: (data: { key: string }, callback) => {
        repositoryLoad.then(() => {

            if (repository.user && repository.user.hasOwnProperty(data.key)) {
                callback(null, repository.user[data.key]);

                repository.on(`update.user.${data.key}`, (value) => {
                    callback(null, value);
                });
            } else {
                const keyList = Object.keys(repository.user || {}).map(k => `“${k}”`).join(", ");
                const msg     = `Key “${data.key}” does not exist in the user storage. Available keys: ${keyList}`;
                callback(new Error(msg));
            }

        }, err => {
            console.log("Watch user error");
            callback(err)
        });
    },

    patchUserRepository: (patch: Partial<UserRepository>, callback) => {
        repositoryLoad.then(() => {
            repository.updateUser(patch, callback);
        }, err => callback(err));
    },

    activateUser: (credentialsID: string, callback) => {
        repositoryLoad.then(() => {
            repository.activateUser(credentialsID, callback);
        }, err => callback(err));
    },

    /**
     * Hey there. Welcome.
     *
     * This fetches all needed platform data for a user.
     * To determine a user, we look at the given credentials ID first. If it's not there, check the active user.
     *
     * Then, we ask the api for the data belonging to that user.
     * A keen eye can notice that the updateUser method is called with the last argument that specifies the credentials entry id
     * explicitly. That's because you can request a fetch, then change the active user before it's done. In that case, new user would
     * get the data of the previous one, so that's how we solve it.
     *
     * Also, this fetching can be called many times from the GUI easily, which can flood the network and the rate limit.
     * That's why there are {@link platformFetchingLocks}. When a platform starts loading data, it creates a Promise,
     * and stores it as a lock, then releases it after it resolves or rejects.
     *
     * If during that time another fetch for the same credentials id is requested, it will not call the api, but instead
     * get a hold of the existing Promise of an ongoing fetch.
     *
     */
    fetchPlatformData: (data: {
        credentialsID?: string
    }, callback) => {
        const {credentialsID} = data;

        repositoryLoad.then(() => {

            let targetCredentials: CredentialsCache;

            if (credentialsID) {
                targetCredentials = repository.local.credentials.find(c => c.id === credentialsID);
                if (!targetCredentials) {
                    return callback(new Error("Cannot fetch platform data for unknown user."));
                }
            } else {

                if (!repository.local.activeCredentials) {
                    return callback(new Error("Cannot fetch platform data when there is no active user."));
                }

                targetCredentials = repository.local.activeCredentials;
            }

            const targetID = targetCredentials.id;

            if (platformFetchingLocks[targetID]) {
                const currentFetch = platformFetchingLocks[targetID];
                currentFetch.then(data => callback(data)).catch(callback);
                return
            }

            const {url, token} = targetCredentials;

            const client            = SBGClient.create(url, token);
            const projectsPromise   = client.projects.all();
            const appsPromise       = client.apps.private();
            const publicAppsPromise = client.apps.public();

            const call = Promise.all([projectsPromise, appsPromise, publicAppsPromise]).then(results => {

                const [projects, apps, publicApps] = results;
                const timestamp                    = Date.now();

                return new Promise((resolve, reject) => {
                    repository.updateUser({
                        apps,
                        projects,
                        publicApps,
                        appFetchTimestamp: timestamp,
                        projectFetchTimestamp: timestamp
                    }, (err, data) => {
                        if (err) return reject(err);

                        resolve(data);
                    }, targetCredentials.id);
                });

            });

            platformFetchingLocks[targetID] = call.then((data) => {
                callback(null, data)
                delete platformFetchingLocks[targetID];
            }).catch(callback);


        }, err => callback(err));
    },

    /**
     * Retrive platform app content.
     * Checks for a swap data first, then falls back to fetching it from the API.
     */
    getPlatformApp: (data: { id: string }, callback) => {

        repositoryLoad.then(() => {

            const credentials    = repository.local.activeCredentials;
            const userRepository = repository.user;

            if (!credentials || !userRepository) {
                callback(new Error("Cannot fetch an app, you are not connected to any platform."));
            }

            swapController.exists(data.id, (err, exists) => {

                if (err) return callback(err);

                if (exists) {
                    swapController.read(data.id, callback);
                    return;
                }

                const api = new SBGClient(credentials.url, credentials.token);
                api.apps.get(data.id).then(response => {
                    callback(null, JSON.stringify(response.raw, null, 4));
                }, err => callback(err));


            });
        }, err => callback(err));
    },

    patchSwap: (data: { local: boolean, swapID: string, swapContent?: string }, callback) => {
        if (data.swapContent === null) {
            swapController.remove(data.swapID, callback);
            return;
        }

        swapController.write(data.swapID, data.swapContent, callback);
    },

    getLocalFileContent: (path, callback) => {

        swapController.exists(path, (err, exists) => {

            if (err) return callback(err);

            if (exists) {
                return swapController.read(path, callback);
            }

            fsController.readFileContent(path, callback);

        });
    },

    saveAppRevision: (data: {
        id: string
        content: string,
    }, callback) => {

        ensurePlatformUser().then(repo => {
            const {url, token} = repo.local.activeCredentials;

            const api = new SBGClient(url, token);

            api.apps.save(data.id, data.content).then(response => {
                callback(null, response);
            }, err => callback(err));

        }, err => callback(err));
    },

    createPlatformApp: (data: { id: string, content: string }, callback) => {

        ensurePlatformUser().then(repo => {
            const {url, token} = repo.local.activeCredentials;

            const api = new SBGClient(url, token);

            return api.apps.create(data.id, data.content).then((response) => {
                callback(null, JSON.parse(response));

                const idParts = data.id.split("/");

                const project = idParts.slice(0, 2).join("/");

                api.apps.private({
                    project,
                    fields: "id,name,project,raw.class,revision"
                }).then((projectApps) => {
                    const newAppList = repo.user.apps.filter(app => app.project !== project).concat(projectApps);
                    repo.updateUser({
                        apps: newAppList
                    }, () => {
                    });
                }, err => {

                });

            }, callback);
        }, callback);
    },

    sendFeedback: (data: { type: string, text: string }, callback) => {
        ensurePlatformUser().then(repo => {
            const {url, token} = repo.local.activeCredentials;
            const api          = new SBGClient(url, token);

            return api.sendFeedback(data.type, data.text);
        }).then(resolve => {
            callback(null, resolve);
        }, callback);
    },

    switchActiveUser: (data: { credentials?: CredentialsCache }, callback) => {
        repositoryLoad.then(() => {

            const originalUser = repository.user;

            const off = repository.on("update.user", (user) => {
                console.log("user comparison", typeof user, typeof originalUser);
                if (user !== originalUser) {
                    off();
                    // @FIXME hack for event receiving order, have no idea why it forks for the moment, figure it out later
                    setTimeout(() => callback(null, repository.local.activeCredentials));
                }
            });

            repository.updateLocal({activeCredentials: data.credentials}, (err, data) => {
                if (err) return callback(err);
            });

        }, err => callback(err));
    },

    getAppUpdates: (data: { appIDs: string[] }, callback) => {
        ensurePlatformUser().then(repo => {
            const {url, token} = repo.local.activeCredentials;
            const api          = new SBGClient(url, token);

            return api.apps.private({
                id: data.appIDs,
                fields: "id,revision,name"
            }).then(result => {
                callback(null, result);
            }, callback);
        }).catch(callback);
    }
};
