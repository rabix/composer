// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/*global jasmine */
const {SpecReporter} = require('jasmine-spec-reporter');
const glob = require("glob");


exports.config = {
    allScriptsTimeout: 11000,
    directConnect: true,
    specs: [
        "./e2e/**/*.e2e-spec.ts"
    ],
    capabilities: {
        browserName: "chrome",
        chromeOptions: {
            binary: (() => {
                const files = glob.sync("build/**/rabix-composer.app/Contents/**/rabix-composer");
                console.log("Found files", files);
                if (!files.length) {
                    throw new Error("You must build and package the app before running e2e tests");
                }
                return files[0];
            })()
        }
    },
    // baseUrl: "http://localhost:4200/",
    framework: "jasmine",
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        print: function () {
        }
    },
    beforeLaunch: function () {
        require('ts-node').register({
            project: 'e2e'
        });
    },
    onPrepare() {
        require('ts-node').register({
            project: 'e2e/tsconfig.json'
        });
        jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));
    }
};
