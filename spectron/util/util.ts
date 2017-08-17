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
    platformRepository: Partial<UserRepository>,
    waitForMainWindow: boolean,
    testTimeout: number

}

function isDevServer() {
    return ~process.argv.indexOf("--dev-server");
}

function findAppBinary() {

    let binaries: string[];

    if (isDevServer()) {
        binaries = glob.sync("./node_modules/.bin/electron");
    } else {
        binaries = glob.sync("./build/**/rabix-composer");
    }


    if (!binaries.length) {
        throw new Error("You must build and package the app before running e2e tests");
    }
    return binaries[0];
}

export function boot(context: ITestCallbackContext, testConfig: Partial<FnTestConfig> = {}): Promise<spectron.Application> {


    context.timeout(testConfig.testTimeout || 5000);

    const testTitle      = context.test.fullTitle();
    const globalTestDir  = path.resolve(`${__dirname}/../../.testrun`);
    const currentTestDir = `${globalTestDir}/${testTitle}`.replace(/\s/g, "-");

    const profilesDirPath  = currentTestDir + "/profiles";
    const localProfilePath = profilesDirPath + "/local.json";

    const swapDirPath = currentTestDir + "/swap";

    testConfig.localRepository = Object.assign(new LocalRepository(), testConfig.localRepository || {});

    fs.outputJSONSync(localProfilePath, testConfig.localRepository, {
        spaces: 4,
        replacer: null
    });
    const appCreation = new spectron.Application({
        path: findAppBinary(),
        args: [
            isDevServer() && "./electron",
            "--spectron",
            "--user-data-dir=" + currentTestDir
        ].filter(v => v)
    });

    return appCreation.start().then((app: any) => {
        Object.assign(app, {testdir: currentTestDir});

        if (testConfig.waitForMainWindow === false) {
            return app;
        }

        return app.client.waitForVisible("ct-layout").then(() => app);

    });
}

export function shutdown(app: spectron.Application) {


    if (app.hasOwnProperty("testdir")) {
        rimraf.sync(app["testdir"]);
    }

    return app.stop();
}
