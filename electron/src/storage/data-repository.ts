import * as ReadWriteLock from "rwlock";
import {decrypt, encrypt} from "../security/encoder";
import {LocalRepository} from "./types/local-repository";
import {RepositoryType} from "./types/repository-type";
import {UserRepository} from "./types/user-repository";

const crypto   = require("crypto");
const fs       = require("fs-extra");
const keychain = require("../keychain");
const logger   = require("../logger").Log;

type UpdateChange = {
    newValue: any;
    oldValue: any;
}
type UpdateChanges = Map<string, UpdateChange>;

export class DataRepository {

    user: UserRepository   = null;
    local: LocalRepository = new LocalRepository();

    private lock      = new ReadWriteLock();
    private listeners = {};
    private profileDirectory: string;

    constructor(profileDirectory: string) {

        this.profileDirectory = profileDirectory;

        this.on("update.local.activeCredentials", (activeCredentials: any) => {

            // Every credentials change should flush user data until new data is loaded
            this.flushUserData();

            // Don't load if no user is active
            if (!activeCredentials) {
                return;
            }

            this.loadProfile(activeCredentials.id, new UserRepository(), (err, data) => {

                if (err) {
                    throw err;
                }

                this.user = data;

                Object.keys(this.user).forEach(key => this.trigger(`update.user.${key}`, this.user[key]));

                if (this.profileMatchesActiveUser(activeCredentials.id)) {
                    this.trigger("update.user", this.user);
                }
            });
        });

        this.on("update.local", (_, changes) => {
            /**
             * When credentials in local profile get updated, we might have to remove some tokens from the keychain.
             */
            if (changes && changes.has("credentials")) {
                const {oldValue, newValue} = changes.get("credentials");

                const oldIDs = oldValue.map(c => c.id);
                const newIDs = newValue.map(c => c.id);

                // Get all ids that existed earlier, but not anymore.
                const prune = oldIDs.filter(id => newIDs.indexOf(id) === -1);

                prune.forEach(cid => keychain.remove(cid).catch(err => {
                    logger.error("Failed to remove token from keychain.", err);
                }));
            }
        });

        this.on("update.local.credentials", () => {

            this.local.credentials.forEach(c => {

                keychain.set(c.id, c.token).catch(ex => {
                    logger.error("Keychain error", ex);
                });
            });

            this.cleanProfiles();
        });
    }

    /**
     * Load local and user (if needed) storage files into memory.
     */
    load(callback: (err?: Error, data?: any) => void): void {

        this.loadProfile("local", new LocalRepository(), (err, localData) => {
            if (err) {
                callback(err);
                return;
            }

            this.local = localData;

            // Load tokens
            const keychainTokens = Promise.all(this.local.credentials.map(c => keychain.get(c.id)));

            keychainTokens.then((tokens) => {

                this.local.credentials.forEach((c, idx) => {
                    c.token = tokens[idx];
                });

                // If there are no active credentials, there are no other profiles to load, so break here
                if (!localData.activeCredentials) {
                    callback();
                    return;
                }

                // If there are active credentials, patch it's token from keychain as well
                this.local.activeCredentials.token = this.local.credentials.find(cred => cred.id === this.local.activeCredentials.id).token;

                this.loadProfile(localData.activeCredentials.id, new UserRepository(), (err, userData) => {
                    if (err) {
                        callback(err);
                        return;
                    }

                    this.user = userData;

                    callback();
                });

            }, err => {
                callback(err);
            });


        });
    }

    updateLocal(data: Partial<LocalRepository>, callback?: (err?: Error, data?: any) => void) {
        this.update("local", data, callback);
    }

    updateUser(data: Partial<UserRepository>, callback?: (err?: Error, data?: any) => void, profileID?) {

        if (profileID) {

            this.update(profileID, data, callback);
            return;
        }

        if (this.local.activeCredentials && this.local.activeCredentials.id) {
            this.update(this.local.activeCredentials.id, data, callback);
            return;
        }

        callback(null);
    }

    /**
     * Sets a listener for an event name
     * @return off function
     */
    on(eventType: string, callback: (result: any, changes?: UpdateChanges) => void): () => void {

        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }

        const evListeners = this.listeners[eventType];

        evListeners.push(callback);

        return () => {
            const idx = evListeners.indexOf(callback);
            evListeners.splice(idx, 1);
        }
    }

    private flushUserData() {
        this.user = null;

        this.trigger(`update.user`, null);
        const demoUser = new UserRepository();
        Object.keys(demoUser).forEach(key => {
            this.trigger(`update.user.${key}`, null);
        });
    }

    private profileExists(profile: string): boolean {
        return this.local.credentials.find(c => c.id === profile) !== undefined;
    }

    private getUpdateDiff(main, patch): UpdateChanges {
        const patchMap = new Map();
        Object.keys(patch).forEach((key) => {
            patchMap.set(key, {
                newValue: patch[key],
                oldValue: main[key]
            });
        });

        return patchMap;
    }

    private update<T extends RepositoryType>(profile: string, data: Partial<T>, callback?: (err?: Error, data?: T) => void) {

        const profilePath = this.getProfileFilePath(profile);

        if (profile === "local") {

            const changes = this.getUpdateDiff(this.local, data);
            Object.assign(this.local, data);
            this.trigger("update.local", this.local, changes);
            this.storageWrite(profilePath, this.local, callback);
        } else {

            // User to update might not be the active user, so we need to check that before emitting this event
            // Also, there might be no active user anymore when fetch gets back, so we need to check that first
            if (this.profileMatchesActiveUser(profile)) {
                // This is the case where updated user is the current user. We can patch the this.user cache

                let diff: UpdateChanges;

                if (this.user) {
                    diff = this.getUpdateDiff(this.user, data);
                    Object.assign(this.user, data);
                } else {
                    const blankUser = new UserRepository();
                    diff            = this.getUpdateDiff(blankUser, data);
                    this.user       = Object.assign(blankUser, data);
                }

                this.trigger(`update.user`, this.user, diff);
                this.storageWrite(profilePath, this.user, callback);
            } else {
                // If update is for a non-active user, we need to load that user's data and patch that instead
                // However, user might be deleted at the time, so we first need to check that

                // Scenario that we need to cover
                // 1) 2 users, 1st active
                // 2) activate 2nd fast
                // 3) activate 1st fast --> two updates pending
                // 4) remove 1st
                // incoming patch would create this deleted user again if we don't prevent it
                if (!this.profileExists(profile)) {
                    return callback();
                }

                this.loadProfile(profile, new UserRepository(), (err, loadedProfileData) => {
                    if (err) return callback(err);

                    const diff = this.getUpdateDiff(loadedProfileData, data);
                    this.trigger(`update.${profile}`, data, diff);

                    const patched = Object.assign(loadedProfileData, data);
                    this.storageWrite(profilePath, patched, callback);
                });

            }


        }

        for (let key in data) {
            this.trigger(["update", profile, key].join("."), data[key]);

            if (profile !== "local" && this.profileMatchesActiveUser(profile)) {
                this.trigger(["update", "user", key].join("."), data[key]);
            }
        }
    }

    /**
     * Tells whether given profile name represents the currently active credentials
     */
    private profileMatchesActiveUser(profile: string): boolean {
        return this.local.activeCredentials && profile === this.local.activeCredentials.id;
    }

    private getProfileFilePath(profile: string): string {
        return `${this.profileDirectory}/${profile}`;
    }

    /**
     * Read data from a storage file
     */
    private loadProfile<T extends Object>(path = "local", defaultData: T, callback: (err: Error, data?: T) => any): void {

        const filePath = this.getProfileFilePath(path);

        if (fs.existsSync(filePath)) {
            this.storageRead(filePath, (err, storageContent: T) => {
                if (err) {
                    return callback(err);
                }

                for (let prop in defaultData) {

                    if (!storageContent.hasOwnProperty(prop)) {
                        storageContent[prop] = defaultData[prop];
                    }
                }
                callback(null, storageContent);
            });
        } else {
            this.storageWrite(filePath, defaultData, err => {
                if (err) return callback(err);

                callback(null, defaultData);
            });
        }
    }

    private trigger(event, data, changes?: UpdateChanges) {
        const eventParts = event.split(".");

        eventParts.forEach((val, index) => {
            const evName = eventParts.slice(0, index + 1).join(".");

            if (this.listeners[evName]) {
                this.listeners[evName].forEach(listener => {
                    listener(data, changes);
                });
            }
        });
    }

    private storageRead(filePath, callback: (err?: Error, content?: any) => void) {
        this.lock.readLock(filePath, (release) => {

            fs.readFile(filePath, "utf8", (err, content) => {
                release();

                if (err) {
                    return callback(err);
                }

                try {
                    const text = decrypt(content);

                    const parsed = JSON.parse(text);
                    callback(null, parsed);

                } catch (err) {
                    // Try to gracefully fallback if we got something that is not json
                    callback(null, {});
                }
            });
        });
    }

    private storageWrite(filePath, input, callback) {

        const copy = Object.assign({}, input);

        if (copy.credentials) {
            Object.assign(copy, {
                credentials: copy.credentials.map(c => Object.assign({}, c, {
                    token: null
                }))
            });
        }

        if (copy.activeCredentials) {
            Object.assign(copy, {
                activeCredentials: Object.assign({}, copy.activeCredentials, {
                    token: null
                })
            });
        }

        const frozen = JSON.stringify(copy, null, 4);

        this.lock.writeLock(filePath, (release) => {

            fs.outputFile(filePath, encrypt(frozen), "utf8", (err, data) => {
                release();
                callback(err, data);
            });
        });
    }

    private cleanProfiles(callback = (err?: Error, data?: any) => {
    }) {
        const profileIDs = this.local.credentials.map(c => c.id);

        fs.readdir(this.profileDirectory, (err, files) => {
            if (err) {
                return callback(err);
            }

            const deletables = files
                .map(file => file.slice(0, -5)) // remove .json extension
                .filter(profile => profile !== "local" && profileIDs.indexOf(profile) === -1) // take just the ones not present in profiles
                .map(profile => new Promise((resolve, reject) => {

                    fs.unlink(this.getProfileFilePath(profile), (err, data) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve(data);
                    });
                }));

            Promise.all(deletables).then(r => callback(null, r), callback);
        });
    }
}
