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
    platformRepositories: { [userID: string]: Partial<UserRepository> } ,
    overrideModules: {
        module: string,
        override: Object
    }[],
    waitForMainWindow: boolean,
    testTimeout: number,
    retries: number,
    swapFiles: { userID: string, content: string }[]

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

    context.retries(testConfig.retries || 0);
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

    if (testConfig.platformRepositories) {
        for (let userID in testConfig.platformRepositories) {
            const profilePath = profilesDirPath + `/${userID}.json`;
            const profileData = Object.assign(new UserRepository(), testConfig.platformRepositories[userID] || {});
            fs.outputJSONSync(profilePath, profileData, {
                spaces: 4,
                replacer: null
            })
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
        "--no-fetch-on-start",
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


    if (app.hasOwnProperty("testdir")) {
        rimraf.sync(app["testdir"]);
    }

    return app.stop();
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
    for (let arg in interpolate) {
        stringified = stringified.replace(new RegExp(arg, "g"), interpolate[arg]);
    }

    return `(${stringified})()`

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

        outputStr = outputStr.replace(new RegExp(argName, "g"), argValue)

    });

    return `(function(){
        ${closureContext}
        return ${outputStr}
    })()`;
}
