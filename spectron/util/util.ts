import * as fs from "fs-extra";
import * as glob from "glob";
import * as path from "path";

import * as spectron from "spectron";
import {LocalRepository} from "../../electron/src/storage/types/local-repository";
import {UserRepository} from "../../electron/src/storage/types/user-repository";
import rimraf = require("rimraf");
import ITestCallbackContext = Mocha.ITestCallbackContext;

interface FnTestConfig {
    localRepository: Partial<LocalRepository>,
    platformRepository: Partial<UserRepository>

}

function findAppBinary() {
    const binaries = glob.sync("./build/**/rabix-composer");

    if (!binaries.length) {
        throw new Error("You must build and package the app before running e2e tests");
    }
    return binaries[0];
}

export function boot(context: ITestCallbackContext, appState?: Partial<FnTestConfig>): Promise<spectron.Application> {
    const testTitle      = context.test.fullTitle();
    const globalTestDir  = path.resolve(`${__dirname}/../../.testrun`);
    const currentTestDir = `${globalTestDir}/${testTitle}`.replace(/\s/g, "-");

    const profilesDirPath  = currentTestDir + "/profiles";
    const localProfilePath = profilesDirPath + "/local.json";

    const swapDirPath = currentTestDir + "/swap";

    appState.localRepository = Object.assign(new LocalRepository(), appState.localRepository || {});

    fs.outputJSONSync(localProfilePath, appState.localRepository, {
        spaces: 4,
        replacer: null
    });
    const appCreation = new spectron.Application({
        path: findAppBinary(),
        args: [
            "--spectron",
            "--user-data-dir=" + currentTestDir
        ]
    });

    return appCreation.start().then(app => {
        Object.assign(app, {testdir: currentTestDir});
        return app;
    });
}

export function shutdown(app: spectron.Application) {


    if (app.hasOwnProperty("testdir")) {
        rimraf.sync(app["testdir"]);
    }

    return app.stop();
}
