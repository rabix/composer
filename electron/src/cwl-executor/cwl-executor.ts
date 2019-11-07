const spawn = require("child_process").spawn;
import * as fs from "fs-extra";
import * as path from "path";
import {CWLExecutorParamsConfig} from "../storage/types/cwl-executor-config";
import {Execution} from "./execution";
import EventEmitter = NodeJS.EventEmitter;

export type ProcessCallback = (err?: Error, stdout?: string, stderr?: string) => void;

export class CWLExecutor {

    executorPath: string = "";

    constructor(executorPath: string = "/usr/local/bin/cwl-runner") {
        this.executorPath = executorPath;
    }

    getVersion(callback?: ProcessCallback, emitter?: EventEmitter) {
        const child = spawn(this.executorPath, ["--version"]);

        let output = "";
        let error  = "";

        child.stdout.on("data", data => {
            output += data
        });

        // some executors post their versions to stderr
        // as data, so also capture those e.g. toil-cwl-runner
        child.stderr.on('data', (data) => {
            output += data;
        });

        child.stderr.on("error", err => {
            error += err + "\n"
        });

        child.on("error", err => {

            callback(new Error("Cannot start the CWL executor."));
        });

        child.on("close", () => {
            if (error) {
                callback(new Error(error));
                return;
            }

            const version = output.match(/\d+\.\d+\.\d+/);
            if (!version) {
                return callback(null, null);
            }

            return callback(null, version[0]);
        });


        if (emitter && child.connected) {
            emitter.on("stop", () => this.killChild(child));
        }
    }

    execute(content: string, jobValue: Object = {}, executionParams: Partial<CWLExecutorParamsConfig> = {}): Promise<Execution> {

        const outDir = executionParams.outDir;

        const appFilePath    = path.join(outDir, "app.cwl");
        const jobFilePath    = path.join(outDir, "job.json");
        const stdoutFilePath = path.join(outDir, "stdout.log");
        const stderrFilePath = path.join(outDir, "stderr.log");

        return Promise.all([
            this.assertDocker()
        ]).then(() => Promise.all([
            this.dumpApp(appFilePath, content),
            this.dumpJob(jobFilePath, jobValue),
            this.ensureFile(stdoutFilePath),
            this.ensureFile(stderrFilePath)
        ])).then(filePaths => {

            const [appPath, jobPath] = filePaths;

            const execution = new Execution(this.executorPath, appPath, jobPath);
            execution.setStdout(stdoutFilePath);
            execution.setStderr(stderrFilePath);
            execution.setCWLExecutionParams(executionParams);

            return execution;
        });

    }

    private killChild(child, callback?) {

        child.stdout.removeAllListeners();
        child.stderr.removeAllListeners();

        child.kill();

        if (typeof callback === "function") {
            callback();
        }
    }

    private assertDocker(): Promise<any> {
        return new Promise((resolve, reject) => {

            const docker = spawn("docker", ["version"]);
            docker.on("close", (exitCode) => {

                if (exitCode !== 0) {
                    reject(new Error("Docker needs to be running in order to execute apps."));
                    return;
                }

                resolve();
            });

            docker.on("error", () => {
                reject(new Error("Docker seems to be missing from your system. Please install it in order to execute apps."));
            });

        });
    }

    private dumpApp(filePath: string, content: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.outputFile(filePath, content, err => {
                err ? reject(err) : resolve(filePath);
            });
        });
    }

    private dumpJob(filePath: string, content: Object = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.outputJson(filePath, content, {spaces: 4}, err => {
                err ? reject(err) : resolve(filePath);
            });
        });
    }

    private ensureFile(filePath): Promise<void> {
        return new Promise((resolve, reject) => fs.ensureFile(filePath, err => err ? reject(err) : resolve()));
    }


}
