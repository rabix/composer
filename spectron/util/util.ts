import * as fs from "fs-extra";
import * as glob from "glob";
import * as path from "path";

import * as spectron from "spectron";
import {LocalRepository} from "../../electron/src/storage/types/local-repository";
import {UserRepository} from "../../electron/src/storage/types/user-repository";
import rimraf = require("rimraf");
import ITestCallbackContext = Mocha.ITestCallbackContext;
import {tryCatch} from "rxjs/util/tryCatch";

interface FnTestConfig {
    localRepository: Partial<LocalRepository>;
    platformRepositories: { [userID: string]: Partial<UserRepository> };
    overrideModules: {
        module: string,
        override: Object
    }[];
    waitForMainWindow: boolean;
    testTimeout: number;
    retries: number;
    skipFetch: boolean;
    skipUpdateCheck: boolean;
    prepareTestData: {
        name: string,
        content: string
    }[];
}

function isDevServer() {
    return ~process.argv.indexOf("--dev-server");
}

function findAppBinary() {

    if (isDevServer()) {
        return glob.sync("./node_modules/.bin/electron")[0];
    } else if (process.platform.startsWith("win")) {
        return glob.sync("./build/**/rabix-composer.exe")[0];
    } else if (process.platform.startsWith("darwin")) {
        return path.resolve("./build/mac/rabix-composer.app/Contents/MacOS/rabix-composer");
    } else {
        return path.resolve("./build/linux-unpacked/rabix-composer");
    }
}

export function getTestDir(context: ITestCallbackContext, appendPath?: string): string {
    const title          = context.test.fullTitle();
    const testRoot       = path.resolve(`${__dirname}/../../.testrun`);
    const currentTestDir = [testRoot, title, appendPath].filter(v => v).join(path.sep).replace(/\s/g, "-");

    return currentTestDir;
}

export function boot(context: ITestCallbackContext, testConfig: Partial<FnTestConfig> = {}): Promise<spectron.Application> {

    context.retries(testConfig.retries || 0);
    context.timeout(testConfig.testTimeout || 30000);

    const skipFetch       = testConfig.skipFetch !== false;
    const skipUpdateCheck = testConfig.skipUpdateCheck !== false;

    const currentTestDir = getTestDir(context);

    if (testConfig.prepareTestData) {
        testConfig.prepareTestData.forEach((data) => {
            fs.outputFileSync([currentTestDir, data.name].join(path.sep), data.content);
        });
    }

    const profilesDirPath  = currentTestDir + "/profiles";
    const localProfilePath = profilesDirPath + "/local";

    testConfig.localRepository = Object.assign(new LocalRepository(), testConfig.localRepository || {});

    testConfig.localRepository.openTabs = testConfig.localRepository.openTabs.map((tab) => {
        if (tab.id.startsWith("test:")) {
            tab.id = tab.id.replace("test:", currentTestDir);
        }
        return tab;
    });


    fs.outputFileSync(localProfilePath, JSON.stringify(testConfig.localRepository));

    if (testConfig.platformRepositories) {
        for (const userID in testConfig.platformRepositories) {
            const profilePath = profilesDirPath + `/${userID}`;
            const profileData = Object.assign(new UserRepository(), testConfig.platformRepositories[userID] || {});

            fs.outputFileSync(profilePath, JSON.stringify(profileData));
        }
    }

    const moduleOverrides = testConfig.overrideModules && JSON.stringify(testConfig.overrideModules, (key, val) => {
        if (typeof val === "function") {
            return val.toString();
        }
        return val;
    });


    const chromiumArgs = [
        isDevServer() && "./electron",
        "--spectron",
        skipFetch && "--no-fetch-on-start",
        skipUpdateCheck && "--no-update-check",
        "--user-data-dir=" + currentTestDir,
        moduleOverrides && `--override-modules=${moduleOverrides}`
    ].filter(v => v);

    const appCreation = new spectron.Application({
        path: findAppBinary(),
        args: chromiumArgs
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

    if (!app) {
        return;
    }

    return app.stop().then(() => {
        return new Promise((resolve, reject) => {
            rimraf(app["testdir"], {maxBusyTries: 5}, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
}

export function partialProxy(module: string, overrides: Object = {}) {

    const __module__    = module;
    const __overrides__ = JSON.stringify(overrides, (key, value) => {
        return typeof value === "function" ? value.toString() : value;
    });

    const interpolate = {
        __module__,
        __overrides__
    };

    const fn = () => {
        const module            = require("__module__");
        const overrideFunctions = __overrides__;
        const overrideKeys      = Object.keys(overrideFunctions);

        return new Proxy(module, {
            get: function (target, name: string, receiver) {

                const indexOfOverride = overrideKeys.indexOf(name);

                if (indexOfOverride === -1) {
                    return target[name];
                }

                const overrideKey = overrideKeys[indexOfOverride];

                return new Proxy(target[name], {
                    apply: function (target, context, args) {
                        return eval(`(${overrideFunctions[overrideKey]})`)(target, context, args);
                    }
                });

            }
        });
    };

    let stringified = fn.toString();
    for (const arg in interpolate) {
        stringified = stringified.replace(new RegExp(arg, "g"), interpolate[arg]);
    }

    return `(${stringified})()`;

}

export function proxerialize(fn: (...args: any[]) => any, ...inputs: any[]): any {

    const fnStr         = fn.toString();
    const argumentNames = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(/([^\s,]+)/g) || [];
    let closureContext  = "";

    let outputStr = fn().toString();

    argumentNames.forEach((argName, index) => {

        if (argName === "$callCount") {
            closureContext += `
                module.exports.__$callCount = (module.exports.__$callCount || 0) + 1;
            `;

            outputStr = outputStr.replace(new RegExp("\\$callCount", "g"), "module.exports.__$callCount");

            return true;
        }

        const argValue = JSON.stringify(inputs[index], (key, val) => {
            switch (typeof val) {
                case "function":
                    return val.toString();
                default:
                    return val;
            }
        });

        outputStr = outputStr.replace(new RegExp(argName, "g"), argValue);

    });

    return `(function(){
        ${closureContext}
        return ${outputStr}
    })()`;
}
