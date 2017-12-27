import * as assert from "assert";
import * as fs from "fs-extra";
import * as YAML from "js-yaml";
import * as path from "path";
import {IPC_EOS_MARK} from "../constants";
import {RabixExecutor} from "./rabix-executor";
import rimraf = require("rimraf");

describe("rabix executor runner", function () {

    let rabix: RabixExecutor;
    let outdir = path.resolve(__dirname + "/test-resources/test-outdir");

    beforeEach(function () {
        rimraf.sync(outdir);
        rabix = new RabixExecutor();
    });

    it("should report version specified in the package", function (done) {

        const requiredVersion = require(__dirname + "/../../../package.json").executorVersion;

        rabix.getVersion((err, version) => {
            if (err) return done(err);

            try {
                assert.equal(version, requiredVersion);
                done();
            } catch (ex) {
                done(ex);
            }

        });
    });

    it("should report missing jre when base process fails", function (done) {
        rabix.jrePath = "jiva";

        rabix.getVersion(err => {
            assert.equal(typeof err, "object");
            assert.notEqual(err.message.indexOf("Java Runtime"), -1, "Failed JRE call did not tell about the missing Java environment.");
            done();
        });
    });

    it("executes a demo app", function (done) {

        const appPath = path.resolve(__dirname + "/test-resources/hello-world/app.yaml");
        const jobPath = path.resolve(__dirname + "/test-resources/hello-world/app.job.yaml");

        const app   = fs.readFileSync(appPath, "utf8");
        const job   = fs.readFileSync(jobPath, "utf8");
        let lastLog = "";


        rabix.execute(app, YAML.safeLoad(job), {
            noContainer: true,
            quiet: true
        },  (err, data) => {

            if (err) {
                return done(err);
            }

            if (data === IPC_EOS_MARK) {
                assert.equal(lastLog, "Done.");
                const outfileContent = fs.readFileSync(outdir + "/root/my-outfile.txt", "utf8");
                assert.equal(outfileContent.trim(), "Hello world!");

                done();
            }

            lastLog = data;
        });


    });


});
