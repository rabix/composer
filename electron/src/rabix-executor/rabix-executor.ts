import {spawn} from "child_process";
import * as fs from "fs-extra";
import * as path from "path";
import * as tmp from "tmp";
import {IPC_EOS_MARK} from "../constants";
import {ExecutorParamsConfig} from "../storage/types/executor-config";
import {ExecutorOutput, MessageType} from "./executor-output";
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

    /**
     * Executes the CWL app.
     *
     * Steps:
     * - Create a temporary file in which CWL description is stored
     * - Write CWL into it
     * - Create a command line from temp file path, job json and other rabix parameters that were given as options
     * - Spawn a rabix process that runs that temporary file with given job json and other execution parameters
     * - Stream output from process stdin and stderr back to the client
     * - Send “null” downstream that marks the end of the process, so the client can unsubscribe.
     * - Clean up temporary stuff
     *
     * Rabix sends execution logs to stderr, so we can't distinguish those from actual errors.1
     *
     * @param {string} content CWL document that describes the app
     * @param jobValue
     * @param {Partial<ExecutorParamsConfig>} executionParams Rabix executor execution parameters
     * @param dataCallback
     * @param emitter
     */
    execute(content: string, jobValue: Object = {}, executionParams: Partial<ExecutorParamsConfig> = {}, dataCallback, emitter?: EventEmitter) {

        const outdir      = executionParams.outDir;
        const appFilePath = `${outdir}/app.cwl`;
        const jobFilePath = `${outdir}/job.json`;

        const cleanupHandlers = [] as Function[];
        const cleanup         = () => cleanupHandlers.forEach(c => c());

        const appFile = new Promise((resolve, reject) => {
            fs.outputFile(appFilePath, content, err => {
                err ? reject(err) : resolve(appFilePath);
            });
        });

        const jobFile = new Promise((resolve, reject) => {
            fs.outputJson(jobFilePath, jobValue, {spaces: 4}, err => {
                err ? reject(err) : resolve(jobFilePath);
            });
        });

        const dockerIsRunning = new Promise((resolve, reject) => {
            const docker = spawn("docker", ["version"]);
            docker.on("close", (exitCode) => {

                if (exitCode !== 0) {
                    dataCallback(new Error("Docker needs to be running in order to execute apps."));
                    cleanup();
                    reject();
                    return;
                }

                resolve();
            });
            docker.on("error", (d) => {
                dataCallback(new Error("Docker seems to be missing from your system. Please install it in order to execute apps."));
                cleanup();
                reject();
            });

        });


        const stdoutLogPath   = executionParams.outDir + "/stdout.log";
        const stderrLogPath   = executionParams.outDir + "/stderr.log";
        const logFilesCreated = Promise.all([
            new Promise((resolve, reject) => fs.ensureFile(stdoutLogPath, err => err ? reject(err) : resolve())),
            new Promise((resolve, reject) => fs.ensureFile(stderrLogPath, err => err ? reject(err) : resolve())),
        ]);

        dockerIsRunning.then(() => Promise.all([
            appFile,
            jobFile,
            logFilesCreated
        ])).then((filePaths: [string, string, any]) => {

            const stdoutWriteStream = fs.createWriteStream(stdoutLogPath, {autoClose: true, encoding: "utf8"});
            const stderrWriteStream = fs.createWriteStream(stderrLogPath, {autoClose: true, encoding: "utf8"});
            cleanupHandlers.push(() => {
                stdoutWriteStream.close();
                stderrWriteStream.close();
            });

            const [appFilePath, jobFilePath] = filePaths;

            const executorArgs = [
                "-jar",
                this.jarPath,
                appFilePath,
                jobFilePath,
                ...this.parseExecutorParamsToArgs(executionParams)
            ];

            const rabixProcess = spawn(this.jrePath, executorArgs, {});

            const terminate = (err?: Error) => {

                rabixProcess.stdout.removeAllListeners();
                rabixProcess.stderr.removeAllListeners();

                rabixProcess.kill();
                if (err) {
                    dataCallback(err);
                }
                cleanup();
            };

            if (emitter) {
                emitter.on("stop", () => terminate());
            }

            rabixProcess.on("error", (err: any) => {
                if (err.code === "ENOENT" && err.path === this.jrePath) {
                    return terminate(new Error("Cannot run Java process. Please check if it is properly installed. "))
                }
                terminate(err);
            });

            const processCommandLine = [this.jrePath, ...executorArgs].join(" ");
            dataCallback(null, {message: `Running “${processCommandLine}”`} as ExecutorOutput);

            rabixProcess.stdout.pipe(stdoutWriteStream);
            rabixProcess.stdout.on("data", (data) => {

                const out = this.parseExecutorOutput(data.toString());

                dataCallback(null, out);
            });


            rabixProcess.stderr.pipe(stderrWriteStream);
            rabixProcess.stderr.on("data", data => {

                const out = this.parseExecutorOutput(data.toString());


                /**
                 * Error logs from Bunny are huge Java stack traces, and this might flush hundreds of them each second.
                 * DOM would blow up when we try to show those, so we'll pipe them to a file.
                 */
                if (out.type === "ERROR") {
                    // @FIXME: pipe this to a file
                } else {
                    dataCallback(null, out);
                }
            });

            // when the spawn child process exits, check if there were any errors and close the writeable stream
            rabixProcess.on("exit", (code, a, b) => {

                cleanup();


                dataCallback(null, {
                    type: "OUTDIR",
                    message: executionParams.outDir
                } as ExecutorOutput);

                if (code !== 0) {
                    return dataCallback(new Error("Execution failed with non-zero exit code."));
                }

                dataCallback(null, {
                    type: "DONE",
                    message: "Execution completed."
                });

                dataCallback(null, IPC_EOS_MARK);
            });

        }).catch(err => {
            cleanup();
            dataCallback(err);
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

    private parseExecutorParamsToArgs(params: Partial<ExecutorParamsConfig> = {}): string[] {


        const output = [];

        if (!params) {
            params = {};
        }

        if (params.baseDir) {
            output.push("--basedir", params.baseDir);
        }

        if (params.verbose) {
            output.push("--verbose");
        }

        if (params.quiet) {
            output.push("--quiet");
        }

        if (params.noContainer) {
            output.push("--no-container");
        }

        if (params.cacheDir) {
            output.push("--cache-dir", params.cacheDir);
        }

        if (params.configurationDir) {
            output.push("--configuration-dir", params.configurationDir);
        }

        if (params.outDir) {
            output.push("--outdir", params.outDir);
        }

        return output;
    }

    private storeToTempFile(content: string): Promise<string> {
        return new Promise((resolve, reject) => {

            tmp.tmpName((err, tmpPath) => {

                if (err) return reject(err);

                fs.writeFile(tmpPath, content, {
                    encoding: "utf8"
                }, (err) => {
                    if (err) return reject(err);

                    resolve(tmpPath);
                });

            });

        });
    }

    private probeBinary(path = "", callback = (err?: Error) => void 0) {
        fs.access(path, fs.constants.X_OK, callback);
    }

    /**
     * Parses output messages according to config specified in logback.xml
     * [%d{yyyy-MM-dd HH:mm:ss.SSS}] [%level] %msg%n
     */
    private parseExecutorOutput(output: string): ExecutorOutput {

        const matcher = /\[(.*?)\]\s\[(.*?)\]\s(.*)/g;

        const matched = matcher.exec(output);

        if (matched === null) {
            return {
                message: output
            }
        }

        const [input, timestamp, type, message] = matched;

        return {
            type: type as MessageType,
            message,
            timestamp
        }

    }


}
