import * as fsExtra from "fs-extra";
import {browser} from "protractor";
import {promise} from "selenium-webdriver";
import {LocalRepository} from "../../electron/src/storage/types/local-repository";
import {callRemoteEndpoint} from "./helpers";

export class ProfileLoader {

    static patchLocal(profile: Partial<LocalRepository>) {

        return callRemoteEndpoint("patchLocalRepository", profile, () => {
            console.log("Done!");
        });
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

            });
    }
}
