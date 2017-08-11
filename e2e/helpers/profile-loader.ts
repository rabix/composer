import * as fsExtra from "fs-extra";
import {browser} from "protractor";
import {promise} from "selenium-webdriver";
import {LocalRepository} from "../../electron/src/storage/types/local-repository";

export class ProfileLoader {

    static patchLocal(profile: Partial<LocalRepository>) {

        const serializedProfile = JSON.stringify(profile);

        return ProfileLoader.callRemoteEndpoint("patchLocalRepository", profile, () => {
            console.log("Done!");
        });

        // return browser.executeAsyncScript(function (profile, callback) {
        //     window["require"]("electron").remote.getGlobal("__endpoints").patchLocalRepository(JSON.parse(profile), () => {
        //         callback("done");
        //     });
        // }, serializedProfile);
    }

    static getTestExecutionDirectory(): promise.Promise<string> {
        return browser.executeScript(`
            return window["require"]("electron").remote.app.getPath("userData");
        `);
    }

    static loadProfileDirectory(dirPath: string) {
        return ProfileLoader.getTestExecutionDirectory()
            .then(executionDir => {
                fsExtra.copySync(dirPath, executionDir, {
                    recursive: true,
                    errorOnExist: false,
                    overwrite: true
                });
            });
    }

    static createSwap(appID: string) {
        return ProfileLoader.getTestExecutionDirectory()
            .then(executionDir => {

            })
    }

    static callRemoteEndpoint(method: string, data: any, callback: Function) {

        return browser.executeAsyncScript(function (method, data, callback) {
            window["require"]("electron").remote.getGlobal("__endpoints")[method](JSON.parse(data), function (err, result) {
                callback(err, result);
            });
        }, method, JSON.stringify(data)).then((data) => {
            callback(null, data);
        }).catch(err => callback(err));
    }
}
