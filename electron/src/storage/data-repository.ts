import * as storage from "electron-storage";
import {LocalRepository} from "./types/local-repository";
import {RepositoryType} from "./types/repository-type";
import {UserRepository} from "./types/user-repository";

export class DataRepository {

    user: UserRepository   = new UserRepository();
    local: LocalRepository = new LocalRepository();

    private storageWriteQueue: { [filePath: string]: Function[] } = {};

    private listeners = {};

    constructor() {
        this.on("update.local.activeCredentials", (activeCredentials: any) => {

            if (!activeCredentials) {
                this.flushUserData();
                return;
            }

            this.loadProfile(activeCredentials.id, new UserRepository(), (err, data) => {
                this.user = data;
                Object.keys(this.user).forEach(key => this.trigger(`update.user.${key}`, this.user[key]));
                this.trigger("update.user", this.user);
            });
        })
    }

    /**
     * Load local and user (if needed) storage files into memory.
     */
    load(callback: (err?: Error, data?: any) => void): void {

        this.loadProfile("local", new LocalRepository(), (err, localData) => {
            if (err) return callback(err);

            this.local = localData;
            if (!localData.activeCredentials) {
                return callback();
            }

            this.loadProfile(localData.activeCredentials.id, new UserRepository(), (err, userData) => {
                if (err) return callback(err);

                this.user = userData;

                callback();
            });
        });
    }

    activateUser(credentialsID?: string, callback?: (err?: Error) => void) {

        // By default, set the update to be deactivation, then check if we need to activate a user
        const patch = {activeCredentials: null} as Partial<LocalRepository>;

        // If we received credentials ID, try to match it to a credentials entry and set that entry as the active one
        if (credentialsID) {
            const credentialsEntryWithGivenID = this.local.credentials.find(entry => entry.id === credentialsID);

            if (credentialsEntryWithGivenID) {
                patch.activeCredentials = credentialsEntryWithGivenID;
            }
        }

        this.updateLocal(patch, (err) => {
            if (err) return callback(err);

            if (patch.activeCredentials === null) {
                this.user = new UserRepository();
                return callback();
            }

            this.loadProfile(patch.activeCredentials.id, new UserRepository(), (err) => {
                if (err) return callback(err);

                callback();
            });
        });
    }

    private flushUserData() {
        this.user = new UserRepository();

        const demoUser = new UserRepository();
        Object.keys(demoUser).forEach(key => {
            this.trigger(`update.user.${key}`, demoUser[key]);
        });
    }

    private update<T extends RepositoryType>(profile: string, data: Partial<T>, callback?: (err?: Error, data?: T) => void) {

        const profilePath = `profiles/${profile}`;
        this.trigger("update", {user: this.user, local: this.local});

        if (profile === "local") {
            Object.assign(this.local, data);
            this.trigger("update.local", this.local);
            this.enqueueStorageWrite(profilePath, this.local, callback);
        } else {
            Object.assign(this.user, data);
            this.trigger(`update.${profile}`, this.user);

            // User to update might not be the active user, so we need to check that before emitting this event
            if (profile === this.local.activeCredentials.id) {
                this.trigger(`update.user`, this.user);
            }

            this.enqueueStorageWrite(profilePath, this.user, callback);
        }

        for (let key in data) {
            this.trigger(["update", profile, key].join("."), data[key]);

            if (profile !== "local" && profile === this.local.activeCredentials.id) {
                this.trigger(["update", "user", key].join("."), data[key]);
            }
        }
    }

    updateLocal(data: Partial<LocalRepository>, callback) {
        this.update("local", data, callback);
    }

    updateUser(data: Partial<UserRepository>, callback, profileID?) {

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
    on(eventType: string, callback: Function): () => void {

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

    /**
     * Read data from a storage file
     */
    private loadProfile<T extends Object>(path = "local", defaultData: T, callback: (err: Error, data?: T) => any): void {

        const filePath = `profiles/${path}.json`;

        storage.isPathExists(filePath, (exists) => {
            if (!exists) {
                this.enqueueStorageWrite(filePath, defaultData, (err) => {
                    if (err) return callback(err);

                    callback(null, defaultData);
                });
                return;
            }

            storage.get(filePath, (err, storageContent: T) => {
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

        });
    }

    private trigger(event, data) {
        const eventParts = event.split(".");

        eventParts.forEach((val, index) => {
            const evName = eventParts.slice(0, index + 1).join(".");

            if (this.listeners[evName]) {
                this.listeners[evName].forEach(listener => {
                    listener(data);
                });
            }
        });
    }

    private enqueueStorageWrite(filePath, data, callback) {

        if (!this.storageWriteQueue[filePath]) {
            this.storageWriteQueue[filePath] = [];
        }
        const pathQueue = this.storageWriteQueue[filePath];

        const executor = () => {
            storage.set(filePath, data, (err, data) => {
                if (err) return callback(err);

                callback(null, data);

                pathQueue.shift();

                if (pathQueue.length) {
                    pathQueue[0]();
                }
            });
        };

        if (pathQueue.length === 2) {
            pathQueue[1] = executor;
            return;
        }

        if (pathQueue.length === 1) {
            pathQueue.push(executor);
            return;
        }

        if (pathQueue.length === 0) {
            pathQueue.push(executor);
            pathQueue[0]();
        }
    }
}
