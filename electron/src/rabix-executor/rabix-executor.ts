const spawn = require("child_process").spawn;
import * as fs from "fs-extra";
import * as path from "path";
import {ExecutorParamsConfig} from "../storage/types/executor-config";
import {Execution} from "./execution";
import EventEmitter = NodeJS.EventEmitter;

export type ProcessCallback = (err?: Error, stdout?: string, stderr?: string) => void;

export function findDefaultExecutorJar() {
    const basePath  = path.normalize(__dirname + "/../../executor/lib/rabix-cli.jar");
    const fixedAsar = basePath.replace("app.asar", "app.asar.unpacked");

    return fixedAsar.replace(
        ["electron", "dist", "executor", "lib"].join(path.sep),
        ["electron", "executor", "lib"].join(path.sep)
    );
}

export class RabixExecutor {

    jarPath = "";
    jrePath = "java";

    constructor(jarPath = findDefaultExecutorJar()) {
        this.jarPath = path.normalize(jarPath);
    }

    getVersion(callback?: ProcessCallback, emitter?: EventEmitter) {
        const child = spawn(this.jrePath, ["-jar", this.jarPath, "--version"]);

        let output = "";
        let error  = "";

        child.stdout.on("data", data => {
            output += data
        });

        child.stderr.on("error", err => {
            error += err + "\n"
        });

        child.on("error", err => {

            callback(new Error("Cannot start Rabix Executor. Did you properly install Java Runtime Environment?"));
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

    execute(content: string, jobValue: Object = {}, executionParams: Partial<ExecutorParamsConfig> = {}): Promise<Execution> {

        const outDir = executionParams.outDir;

        const appFilePath    = path.join(outDir, "app.cwl");
        const jobFilePath    = path.join(outDir, "job.json");
        const stdoutFilePath = path.join(outDir, "stdout.log");
        const stderrFilePath = path.join(outDir, "stderr.log");

        return Promise.all([
            this.assertJava(),
            this.assertDocker()
        ]).then(() => Promise.all([
            this.dumpApp(appFilePath, content),
            this.dumpJob(jobFilePath, jobValue),
            this.ensureFile(stdoutFilePath),
            this.ensureFile(stderrFilePath)
        ])).then(filePaths => {

            const [appPath, jobPath] = filePaths;

            const execution = new Execution(this.jrePath, this.jarPath, appPath, jobPath);
            execution.setStdout(stdoutFilePath);
            execution.setStderr(stderrFilePath);
            execution.setExecutionParams(executionParams);

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

    private assertJava(versionRequirement = 1.8): Promise<any> {

        return new Promise((resolve, reject) => {
            const java = spawn("java", ["-version"]);

            java.on("error", () => {
                reject(new Error("Please install Java 8 or higher in order to execute apps."));
            });

            java.stderr.once("data", (data) => {
                data = data.toString().split("\n")[0];

                try {
                    const javaVersion = parseFloat(data.match(/\"(.*?)\"/)[1]);

                    if (javaVersion >= versionRequirement) {
                        return resolve();
                    }
                    reject(new Error("Update Java to version 8 or above."));

                } catch (err) {
                    reject(new Error("Please install Java 8 or higher in order to execute apps."));
                }
            });
        });
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
